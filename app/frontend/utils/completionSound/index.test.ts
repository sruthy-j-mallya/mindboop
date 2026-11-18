import { afterEach, describe, expect, it, vi } from "vitest";

import { COMPLETION_SOUNDS } from "./constants";

const param = () => ({
  value: 0,
  setValueAtTime: vi.fn(),
  linearRampToValueAtTime: vi.fn(),
  exponentialRampToValueAtTime: vi.fn(),
});
const node = () => ({ connect: vi.fn((target: unknown) => target), disconnect: vi.fn() });
const source = () => ({ ...node(), start: vi.fn(), stop: vi.fn(), onended: null });

type FakeOscillator = ReturnType<typeof source> & { frequency: ReturnType<typeof param> };

const oscillators: FakeOscillator[] = [];

class FakeAudioContext {
  currentTime = 0;
  sampleRate = 8000;
  destination = node();
  resume = vi.fn(() => Promise.resolve());
  createGain = () => ({ ...node(), gain: param() });
  createBiquadFilter = () => ({ ...node(), type: "", frequency: param(), Q: param() });
  createBufferSource = () => ({ ...source(), buffer: null });
  createBuffer = (_channels: number, length: number, sampleRate: number) => ({
    length,
    sampleRate,
    copyToChannel: vi.fn(),
  });
  createOscillator = () => {
    const oscillator = { ...source(), type: "", frequency: param() };
    oscillators.push(oscillator);

    return oscillator;
  };
}

const startFrequencies = () =>
  oscillators.map(({ frequency }) => Math.round(frequency.setValueAtTime.mock.calls[0][0] as number));

describe("completion sound", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
    oscillators.length = 0;
  });

  it("does nothing without Web Audio", async () => {
    const { playCompletionSound } = await import("@/utils/completionSound");

    expect(() => playCompletionSound()).not.toThrow();
  });

  it("plays the given sound", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);
    const { playCompletionSound } = await import("@/utils/completionSound");

    playCompletionSound("rising");

    expect(startFrequencies()).toEqual([1900, 2540]);
    expect(oscillators[1].start.mock.calls[0][0]).toBeGreaterThan(oscillators[0].start.mock.calls[0][0]);
  });

  it("plays the two-note chime as rising notes with a quiet octave each", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);
    const { playCompletionSound } = await import("@/utils/completionSound");

    playCompletionSound("chime");

    expect(startFrequencies()).toEqual([784, 1568, 1175, 2349]);
  });

  it("stays silent when the sound is off", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);
    const { playCompletionSound } = await import("@/utils/completionSound");

    playCompletionSound("none");

    expect(oscillators).toHaveLength(0);
  });

  it("stays silent until the user's choice is known", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);
    const { playCompletionSound } = await import("@/utils/completionSound");

    playCompletionSound(undefined);

    expect(oscillators).toHaveLength(0);
  });

  it.each(COMPLETION_SOUNDS.filter(({ id }) => id !== "none").map(({ id }) => id))("plays %s", async (id) => {
    vi.stubGlobal("AudioContext", FakeAudioContext);
    const { playCompletionSound } = await import("@/utils/completionSound");

    playCompletionSound(id);

    expect(oscillators.length).toBeGreaterThan(0);
  });
});
