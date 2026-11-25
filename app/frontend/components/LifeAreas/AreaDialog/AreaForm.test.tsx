import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DEFAULT_VOLUME, NO_SOUND } from "@/components/commons/Ambience/constants";
import { playSound } from "@/components/commons/Ambience/utils";
import useAmbienceStore from "@/stores/useAmbienceStore";
import { renderWithProviders } from "@/test/utils";

import AreaForm from "./AreaForm";
import { INITIAL_FORM_VALUES } from "./constants";

vi.mock("@/components/commons/Ambience/utils", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/components/commons/Ambience/utils")>()),
  playSound: vi.fn(),
}));

const stopSound = vi.fn();
const createdContexts: FakeAudioContext[] = [];

class FakeAudioContext {
  state = "running";
  currentTime = 0;
  destination = {};
  resume = vi.fn(() => Promise.resolve());
  close = vi.fn(() => Promise.resolve());
  createGain = () => ({ gain: { value: 1, setTargetAtTime: vi.fn() }, connect: vi.fn() });

  constructor() {
    createdContexts.push(this);
  }
}

const renderForm = () =>
  renderWithProviders(
    <AreaForm
      initialValues={{ ...INITIAL_FORM_VALUES, defaultSound: "rain" }}
      isSubmitting={false}
      submitLabel="Save"
      onSubmit={vi.fn()}
    />,
  );

describe("AreaForm", () => {
  beforeEach(() => {
    vi.stubGlobal("AudioContext", FakeAudioContext);
    vi.mocked(playSound).mockReturnValue(stopSound);
    useAmbienceStore.setState({ soundId: NO_SOUND, volume: DEFAULT_VOLUME });
    createdContexts.length = 0;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("previews a background sound once it is picked, not the one it opens with", async () => {
    const { unmount } = renderForm();
    expect(playSound).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("radio", { name: "Waves" }));
    expect(playSound).toHaveBeenLastCalledWith(expect.anything(), expect.anything(), "waves");

    await userEvent.click(screen.getByRole("radio", { name: "None" }));
    expect(stopSound).toHaveBeenCalledTimes(1);
    expect(playSound).toHaveBeenCalledTimes(1);

    unmount();
    expect(createdContexts[0].close).toHaveBeenCalled();
  });

  it("leaves the app's background sound as it is", async () => {
    renderForm();

    await userEvent.click(screen.getByRole("radio", { name: "Waves" }));
    expect(useAmbienceStore.getState().soundId).toBe(NO_SOUND);
  });
});
