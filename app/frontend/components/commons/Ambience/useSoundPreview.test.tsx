import { act, renderHook } from "@testing-library/react";
import type { ChangeEvent } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useAmbience from "./useAmbience";
import useSoundPreview from "./useSoundPreview";

vi.mock("./useAmbience", () => ({ default: vi.fn() }));

const pick = (value: string) => ({ target: { value } }) as ChangeEvent<HTMLInputElement>;

const lastAmbienceOptions = () => vi.mocked(useAmbience).mock.lastCall?.[0];

describe("useSoundPreview", () => {
  beforeEach(() => vi.useFakeTimers());

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("plays a picked sound for a few seconds, then stops", () => {
    const { result } = renderHook(() => useSoundPreview());
    expect(lastAmbienceOptions()).toMatchObject({ isPlaying: false });

    act(() => result.current(pick("rain")));
    expect(lastAmbienceOptions()).toMatchObject({ soundId: "rain", isPlaying: true });

    act(() => vi.advanceTimersByTime(3_999));
    expect(lastAmbienceOptions()).toMatchObject({ isPlaying: true });
    act(() => vi.advanceTimersByTime(1));
    expect(lastAmbienceOptions()).toMatchObject({ isPlaying: false });
  });

  it("switches to another sound and starts its few seconds over", () => {
    const { result } = renderHook(() => useSoundPreview());

    act(() => result.current(pick("rain")));
    act(() => vi.advanceTimersByTime(3_000));
    act(() => result.current(pick("waves")));
    act(() => vi.advanceTimersByTime(3_000));

    expect(lastAmbienceOptions()).toMatchObject({ soundId: "waves", isPlaying: true });
  });

  it("stops when None is picked", () => {
    const { result } = renderHook(() => useSoundPreview());

    act(() => result.current(pick("rain")));
    act(() => result.current(pick("none")));

    expect(lastAmbienceOptions()).toMatchObject({ isPlaying: false });
  });
});
