import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/apis/axios";
import routinesApi from "@/apis/routines";
import type { Routine, RoutineResponse } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";

import { useMoveRoutine } from "./useRoutinesApi";

const buildRoutine = (id: string): Routine => ({
  id,
  title: id,
  emoji: "🧘",
  color: "violet",
  sound: "none",
  durationMinutes: 10,
  reminderTime: null,
  reminderDays: [],
  steps: [],
  sessionsCount: 0,
  totalSeconds: 0,
  lastDoneAt: null,
  createdAt: "2026-11-05T10:00:00.000Z",
  updatedAt: "2026-11-05T10:00:00.000Z",
});

const renderMove = () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(QUERY_KEYS.ROUTINES.LIST, ["shower", "meditation", "walk"].map(buildRoutine));
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useMoveRoutine(), { wrapper });
  const listedIds = () => queryClient.getQueryData<Routine[]>(QUERY_KEYS.ROUTINES.LIST)?.map(({ id }) => id);
  const move = (id: string, position: number) => act(() => result.current.mutate({ id, position }));

  return { listedIds, move };
};

describe("useMoveRoutine", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("moves the routine at once", async () => {
    vi.spyOn(routinesApi, "update").mockReturnValue(new Promise(() => {}));
    const { listedIds, move } = renderMove();

    move("walk", 0);

    await waitFor(() => expect(listedIds()).toEqual(["walk", "shower", "meditation"]));
  });

  it("puts the order back when the move fails", async () => {
    let fail: (error: ApiError) => void = () => {};
    vi.spyOn(routinesApi, "update").mockReturnValue(
      new Promise((_resolve, reject) => {
        fail = reject;
      }),
    );
    const { listedIds, move } = renderMove();

    move("shower", 2);
    await waitFor(() => expect(listedIds()).toEqual(["meditation", "walk", "shower"]));
    act(() => fail(new ApiError(500, "Something went wrong")));

    await waitFor(() => expect(listedIds()).toEqual(["shower", "meditation", "walk"]));
  });

  it("sends a second move only once the first is saved", async () => {
    const saves: ((response: RoutineResponse) => void)[] = [];
    const update = vi.spyOn(routinesApi, "update").mockImplementation(
      () =>
        new Promise((resolve) => {
          saves.push(resolve);
        }),
    );
    const { listedIds, move } = renderMove();

    move("walk", 0);
    move("shower", 2);

    await waitFor(() => expect(listedIds()).toEqual(["walk", "meditation", "shower"]));
    expect(update).toHaveBeenCalledOnce();
    act(() => saves.at(0)?.({ routine: buildRoutine("walk") }));
    await waitFor(() => expect(update).toHaveBeenLastCalledWith({ id: "shower", position: 2 }));
  });
});
