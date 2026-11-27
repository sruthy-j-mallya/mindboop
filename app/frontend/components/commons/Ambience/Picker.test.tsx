import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { TimeLog } from "@/apis/types";
import useAmbienceStore from "@/stores/useAmbienceStore";
import { renderWithProviders } from "@/test/utils";

import { DEFAULT_VOLUME, NO_SOUND, SOUND_STORAGE_KEY, VOLUME_STORAGE_KEY } from "./constants";
import Ambience from "./index";
import Picker from "./Picker";
import { playSound } from "./utils";

vi.mock("./utils", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./utils")>()),
  playSound: vi.fn(),
}));

const STARTED_AT = "2026-11-05T10:00:00.000Z";

const TIME_LOG: TimeLog = {
  id: "5b7c9e14-2a3d-4f60-8e1b-6c4d2f0a9b37",
  taskId: "2f6e3c1a-0b7d-4c55-9a1e-7d0a4b8e1f23",
  title: null,
  taskTitle: null,
  routineId: null,
  routineTitle: null,
  lifeAreaId: null,
  isTaskDeleted: false,
  mode: "timer",
  timerPreset: 25,
  bufferMinutes: 0,
  accumulatedElapsedSeconds: 0,
  isRunning: true,
  currentRunStartedAt: STARTED_AT,
  startedAt: STARTED_AT,
  completedAt: null,
  checkedRoutineStepIds: [],
  isFinishedEarly: false,
  currentBreak: null,
  breaks: [],
  createdAt: STARTED_AT,
  updatedAt: STARTED_AT,
};

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

describe("Picker", () => {
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

  it("starts on None and offers the sounds", async () => {
    renderWithProviders(<Picker />);

    await openPicker();

    expect(screen.getByRole("button", { name: "None" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Rain" })).toHaveAttribute("aria-pressed", "false");
    ["Bells", "Harp", "Flute", "Morning dew", "Night"].forEach((name) =>
      expect(screen.getByRole("button", { name })).toBeVisible(),
    );
  });

  it("plays the chosen sound in a running session and remembers it", async () => {
    renderWithProviders(
      <>
        <Picker />
        <Ambience timeLog={TIME_LOG} />
      </>,
    );

    await openPicker();
    await userEvent.click(screen.getByRole("button", { name: "Rain" }));

    expect(screen.getByRole("button", { name: "Rain" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Background sound: Rain" })).toBeInTheDocument();
    expect(playSound).toHaveBeenCalledWith(createdContexts[0], expect.anything(), "rain");
    expect(localStorage.getItem(SOUND_STORAGE_KEY)).toBe("rain");
  });

  it("changes and remembers the volume", async () => {
    renderWithProviders(<Picker />);

    await openPicker();
    fireEvent.change(screen.getByRole("slider", { name: "Volume" }), { target: { value: "100" } });

    expect(screen.getByRole("slider", { name: "Volume" })).toHaveValue("100");
    expect(useAmbienceStore.getState().volume).toBe(100);
    expect(localStorage.getItem(VOLUME_STORAGE_KEY)).toBe("100");
  });
});
