import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { TimeLog } from "@/apis/types";
import { renderWithProviders } from "@/test/utils";

import { SOUND_STORAGE_KEY, VOLUME_STORAGE_KEY } from "./constants";
import Ambience from "./index";
import { playSound } from "./utils";

vi.mock("./utils", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./utils")>()),
  playSound: vi.fn(),
}));

const STARTED_AT = "2026-11-05T10:00:00.000Z";

const TIME_LOG: TimeLog = {
  id: "5b7c9e14-2a3d-4f60-8e1b-6c4d2f0a9b37",
  taskId: "2f6e3c1a-0b7d-4c55-9a1e-7d0a4b8e1f23",
  mode: "timer",
  timerPreset: 25,
  bufferMinutes: 0,
  accumulatedElapsedSeconds: 0,
  isRunning: true,
  currentRunStartedAt: STARTED_AT,
  startedAt: STARTED_AT,
  completedAt: null,
  isFinishedEarly: false,
  currentBreak: null,
  createdAt: STARTED_AT,
  updatedAt: STARTED_AT,
};

const PAUSED_TIME_LOG: TimeLog = { ...TIME_LOG, isRunning: false, currentRunStartedAt: null };

const stopSound = vi.fn();
const setMasterVolume = vi.fn();
const createdContexts: FakeAudioContext[] = [];

class FakeAudioContext {
  state = "running";
  currentTime = 0;
  destination = {};
  resume = vi.fn(() => Promise.resolve());
  close = vi.fn(() => Promise.resolve());
  createGain = () => ({ gain: { value: 1, setTargetAtTime: setMasterVolume }, connect: vi.fn() });

  constructor() {
    createdContexts.push(this);
  }
}

const openPicker = async () => {
  await userEvent.click(screen.getByRole("button", { name: /Background sound/ }));

  return screen.findByRole("dialog", { name: "Background sound" });
};

describe("Ambience", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    vi.setSystemTime(new Date(STARTED_AT).getTime() + 37_000);
    vi.stubGlobal("AudioContext", FakeAudioContext);
    vi.mocked(playSound).mockReturnValue(stopSound);
    localStorage.clear();
    createdContexts.length = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("starts silent and offers the sounds", async () => {
    renderWithProviders(<Ambience timeLog={TIME_LOG} />);

    await openPicker();

    expect(screen.getByRole("button", { name: "None" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Rain" })).toHaveAttribute("aria-pressed", "false");
    expect(createdContexts).toHaveLength(0);
    expect(playSound).not.toHaveBeenCalled();
  });

  it("plays the chosen sound while the timer runs and remembers it", async () => {
    renderWithProviders(<Ambience timeLog={TIME_LOG} />);

    await openPicker();
    await userEvent.click(screen.getByRole("button", { name: "Rain" }));

    expect(screen.getByRole("button", { name: "Rain" })).toHaveAttribute("aria-pressed", "true");
    expect(playSound).toHaveBeenCalledWith(createdContexts[0], expect.anything(), "rain");
    expect(localStorage.getItem(SOUND_STORAGE_KEY)).toBe("rain");
  });

  it("switches sounds without stacking them", async () => {
    localStorage.setItem(SOUND_STORAGE_KEY, "rain");
    renderWithProviders(<Ambience timeLog={TIME_LOG} />);

    await openPicker();
    await userEvent.click(screen.getByRole("button", { name: "Waves" }));

    expect(stopSound).toHaveBeenCalledTimes(1);
    expect(playSound).toHaveBeenLastCalledWith(createdContexts[0], expect.anything(), "waves");
    expect(createdContexts).toHaveLength(1);
  });

  it("stays quiet while the timer is paused and plays once it resumes", () => {
    localStorage.setItem(SOUND_STORAGE_KEY, "brown");
    const { rerender } = renderWithProviders(<Ambience timeLog={PAUSED_TIME_LOG} />);

    expect(playSound).not.toHaveBeenCalled();

    rerender(<Ambience timeLog={TIME_LOG} />);

    expect(playSound).toHaveBeenCalledWith(expect.anything(), expect.anything(), "brown");

    rerender(<Ambience timeLog={PAUSED_TIME_LOG} />);

    expect(stopSound).toHaveBeenCalledTimes(1);
  });

  it("stops when the time runs out", () => {
    localStorage.setItem(SOUND_STORAGE_KEY, "clock");
    renderWithProviders(
      <Ambience timeLog={{ ...TIME_LOG, timerPreset: 1, accumulatedElapsedSeconds: 20 }} />,
    );

    expect(playSound).toHaveBeenCalledWith(expect.anything(), expect.anything(), "clock");

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(stopSound).toHaveBeenCalledTimes(1);
  });

  it("keeps playing a stopwatch with no end", () => {
    localStorage.setItem(SOUND_STORAGE_KEY, "piano");
    renderWithProviders(<Ambience timeLog={{ ...TIME_LOG, mode: "stopwatch", timerPreset: null }} />);

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(playSound).toHaveBeenCalledWith(expect.anything(), expect.anything(), "piano");
    expect(stopSound).not.toHaveBeenCalled();
  });

  it("stops the sound when the session ends", () => {
    localStorage.setItem(SOUND_STORAGE_KEY, "wind");
    const { unmount } = renderWithProviders(<Ambience timeLog={TIME_LOG} />);

    unmount();

    expect(stopSound).toHaveBeenCalledTimes(1);
    expect(createdContexts[0].close).toHaveBeenCalled();
  });

  it("changes and remembers the volume", async () => {
    localStorage.setItem(SOUND_STORAGE_KEY, "campfire");
    renderWithProviders(<Ambience timeLog={TIME_LOG} />);

    await openPicker();
    fireEvent.change(screen.getByRole("slider", { name: "Volume" }), { target: { value: "100" } });

    expect(screen.getByRole("slider", { name: "Volume" })).toHaveValue("100");
    expect(setMasterVolume).toHaveBeenCalledWith(1, 0, expect.any(Number));
    expect(localStorage.getItem(VOLUME_STORAGE_KEY)).toBe("100");
  });
});
