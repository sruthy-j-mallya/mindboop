import { act } from "@testing-library/react";

import type { TimeLog } from "@/apis/types";
import useAmbienceStore from "@/stores/useAmbienceStore";
import { renderWithProviders } from "@/test/utils";

import { DEFAULT_VOLUME, NO_SOUND } from "./constants";
import Ambience from "./index";
import type { SoundId } from "./types";
import { playSound } from "./utils";

vi.mock("./utils", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./utils")>()),
  playSound: vi.fn(),
}));

const STARTED_AT = "2026-11-05T10:00:00.000Z";

const TASK_ID = "2f6e3c1a-0b7d-4c55-9a1e-7d0a4b8e1f23";

const TIME_LOG: TimeLog = {
  id: "5b7c9e14-2a3d-4f60-8e1b-6c4d2f0a9b37",
  taskId: TASK_ID,
  title: null,
  taskTitle: null,
  isTaskDeleted: false,
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

const chooseSound = (soundId: SoundId) => act(() => useAmbienceStore.getState().setSoundId(soundId));

describe("Ambience", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    vi.setSystemTime(new Date(STARTED_AT).getTime() + 37_000);
    vi.stubGlobal("AudioContext", FakeAudioContext);
    vi.mocked(playSound).mockReturnValue(stopSound);
    localStorage.clear();
    // The store lives in module state, so each test starts from the defaults.
    useAmbienceStore.setState({ soundId: NO_SOUND, volume: DEFAULT_VOLUME });
    createdContexts.length = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("stays silent with no sound chosen", () => {
    renderWithProviders(<Ambience timeLog={TIME_LOG} />);

    expect(createdContexts).toHaveLength(0);
    expect(playSound).not.toHaveBeenCalled();
  });

  it("plays the chosen sound while the timer runs and switches without stacking", () => {
    chooseSound("rain");
    renderWithProviders(<Ambience timeLog={TIME_LOG} />);

    expect(playSound).toHaveBeenCalledWith(createdContexts[0], expect.anything(), "rain");

    chooseSound("waves");

    expect(stopSound).toHaveBeenCalledTimes(1);
    expect(playSound).toHaveBeenLastCalledWith(createdContexts[0], expect.anything(), "waves");
    expect(createdContexts).toHaveLength(1);
  });

  it("stays quiet while the timer is paused and plays once it resumes", () => {
    chooseSound("harp");
    const { rerender } = renderWithProviders(<Ambience timeLog={PAUSED_TIME_LOG} />);

    expect(playSound).not.toHaveBeenCalled();

    rerender(<Ambience timeLog={TIME_LOG} />);

    expect(playSound).toHaveBeenCalledWith(expect.anything(), expect.anything(), "harp");

    rerender(<Ambience timeLog={PAUSED_TIME_LOG} />);

    expect(stopSound).toHaveBeenCalledTimes(1);
  });

  it("stops when the time runs out", () => {
    chooseSound("clock");
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
    chooseSound("piano");
    renderWithProviders(<Ambience timeLog={{ ...TIME_LOG, mode: "stopwatch", timerPreset: null }} />);

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(playSound).toHaveBeenCalledWith(expect.anything(), expect.anything(), "piano");
    expect(stopSound).not.toHaveBeenCalled();
  });

  it("stops the sound when the session ends", () => {
    chooseSound("wind");
    const { unmount } = renderWithProviders(<Ambience timeLog={TIME_LOG} />);

    unmount();

    expect(stopSound).toHaveBeenCalledTimes(1);
    expect(createdContexts[0].close).toHaveBeenCalled();
  });

  it("follows the chosen volume", () => {
    chooseSound("campfire");
    renderWithProviders(<Ambience timeLog={TIME_LOG} />);

    act(() => useAmbienceStore.getState().setVolume(100));

    expect(setMasterVolume).toHaveBeenCalledWith(1, 0, expect.any(Number));
  });
});
