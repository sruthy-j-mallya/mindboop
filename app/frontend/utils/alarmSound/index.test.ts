import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ALARM_PATTERNS, ALARM_SOUNDS, PREVIEW_MILLISECONDS } from "./constants";
import { renderPattern } from "./utils";

const SAMPLE_RATE = 8000;

type FakeSource = {
  buffer: { samples: Float32Array<ArrayBufferLike> } | null;
  loop: boolean;
  start: unknown;
  stop: unknown;
};

const sources: FakeSource[] = [];

class FakeAudioContext {
  sampleRate = SAMPLE_RATE;
  destination = {};
  resume = vi.fn(() => Promise.resolve());
  createBuffer = (_channels: number, length: number) => ({
    samples: new Float32Array(length) as Float32Array<ArrayBufferLike>,
    copyToChannel(samples: Float32Array) {
      this.samples = samples;
    },
  });
  createBufferSource = () => {
    const source = {
      buffer: null,
      loop: false,
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    sources.push(source);

    return source;
  };
}

const peak = (samples: Float32Array) => samples.reduce((max, sample) => Math.max(max, Math.abs(sample)), 0);

describe("alarm sound", () => {
  beforeEach(() => vi.stubGlobal("AudioContext", FakeAudioContext));

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.resetModules();
    sources.length = 0;
  });

  it.each(ALARM_SOUNDS.map(({ id }) => id))("renders %s as an audible, unclipped loop", (id) => {
    const pattern = ALARM_PATTERNS.get(id);
    if (!pattern) throw new Error(`No pattern for ${id}`);

    const samples = renderPattern(pattern, SAMPLE_RATE);

    expect(samples).toHaveLength(Math.round(pattern.loopSeconds * SAMPLE_RATE));
    expect(peak(samples)).toBeGreaterThan(0.1);
    expect(peak(samples)).toBeLessThanOrEqual(1);
    // Starts and ends near silence, so the loop doesn't click where it wraps.
    expect(Math.abs(samples[0])).toBeLessThan(0.01);
    expect(Math.abs(samples[samples.length - 1])).toBeLessThan(0.01);
  });

  it("loops the chosen alarm until stopped", async () => {
    const { startAlarmSound } = await import("@/utils/alarmSound");

    const stop = startAlarmSound("chimes");

    expect(sources).toHaveLength(1);
    expect(sources[0].loop).toBe(true);
    expect(sources[0].buffer?.samples).toHaveLength(2 * SAMPLE_RATE);
    expect(sources[0].start).toHaveBeenCalled();

    stop();

    expect(sources[0].stop).toHaveBeenCalled();
  });

  it("plays the classic beep until the user's choice is known", async () => {
    const { startAlarmSound } = await import("@/utils/alarmSound");

    startAlarmSound(undefined);

    expect(sources[0].buffer?.samples).toHaveLength(SAMPLE_RATE);
  });

  it("stops a preview after a few seconds, or when the next one starts", async () => {
    vi.useFakeTimers();
    const { previewAlarmSound } = await import("@/utils/alarmSound");

    previewAlarmSound("bell");
    previewAlarmSound("digital");

    expect(sources[0].stop).toHaveBeenCalled();
    expect(sources[1].stop).not.toHaveBeenCalled();

    vi.advanceTimersByTime(PREVIEW_MILLISECONDS);

    expect(sources[1].stop).toHaveBeenCalled();
  });
});
