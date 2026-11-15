import { afterEach, describe, expect, it, vi } from "vitest";

const param = () => ({
  value: 0,
  setValueAtTime: vi.fn(),
  linearRampToValueAtTime: vi.fn(),
  exponentialRampToValueAtTime: vi.fn(),
});
const node = () => ({ connect: vi.fn((target: unknown) => target), disconnect: vi.fn() });

type FakeOscillator = { frequency: { value: number }; start: ReturnType<typeof vi.fn> };

const oscillators: FakeOscillator[] = [];

class FakeAudioContext {
  currentTime = 0;
  destination = node();
  resume = vi.fn(() => Promise.resolve());
  createGain = () => ({ ...node(), gain: param() });
  createOscillator = () => {
    const oscillator = {
      ...node(),
      type: "",
      frequency: param(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null,
    };
    oscillators.push(oscillator);

    return oscillator;
  };
}

describe("playCompletionSound", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
    oscillators.length = 0;
  });

  it("does nothing without Web Audio", async () => {
    const { playCompletionSound } = await import("@/utils/completionSound");

    expect(() => playCompletionSound()).not.toThrow();
  });

  it("plays two rising notes", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);
    const { playCompletionSound } = await import("@/utils/completionSound");

    playCompletionSound();

    const fundamentals = oscillators.filter((_, index) => index % 2 === 0);
    expect(fundamentals.map(({ frequency }) => Math.round(frequency.value))).toEqual([784, 1175]);
    expect(fundamentals[1].start.mock.calls[0][0]).toBeGreaterThan(fundamentals[0].start.mock.calls[0][0]);
  });
});
