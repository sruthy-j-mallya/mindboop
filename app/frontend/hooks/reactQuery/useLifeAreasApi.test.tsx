import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/apis/axios";
import lifeAreasApi from "@/apis/life_areas";
import type { LifeArea, LifeAreaResponse } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";

import { useMoveLifeArea } from "./useLifeAreasApi";

const buildLifeArea = (id: string, isDeleted = false): LifeArea => ({
  id,
  name: id,
  color: "indigo",
  emoji: "💼",
  defaultSound: "none",
  isDeleted,
  createdAt: "2026-11-05T10:00:00.000Z",
  updatedAt: "2026-11-05T10:00:00.000Z",
});

const work = buildLifeArea("work");
const deleted = buildLifeArea("deleted", true);
const health = buildLifeArea("health");
const leisure = buildLifeArea("leisure");

const renderMove = () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(QUERY_KEYS.LIFE_AREAS.LIST, [work, deleted, health, leisure]);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useMoveLifeArea(), { wrapper });
  const listedIds = () =>
    queryClient.getQueryData<LifeArea[]>(QUERY_KEYS.LIFE_AREAS.LIST)?.map(({ id }) => id);
  const move = (id: string, position: number) => act(() => result.current.mutate({ id, position }));

  return { listedIds, move };
};

describe("useMoveLifeArea", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("moves the area at once among the undeleted ones, keeping the deleted ones", async () => {
    vi.spyOn(lifeAreasApi, "update").mockReturnValue(new Promise(() => {}));
    const { listedIds, move } = renderMove();

    move("leisure", 1);

    await waitFor(() => expect(listedIds()).toEqual(["work", "leisure", "health", "deleted"]));
  });

  it("puts the order back when the move fails", async () => {
    let fail: (error: ApiError) => void = () => {};
    vi.spyOn(lifeAreasApi, "update").mockReturnValue(
      new Promise((_resolve, reject) => {
        fail = reject;
      }),
    );
    const { listedIds, move } = renderMove();

    move("leisure", 0);
    await waitFor(() => expect(listedIds()).toEqual(["leisure", "work", "health", "deleted"]));
    act(() => fail(new ApiError(500, "Something went wrong")));

    await waitFor(() => expect(listedIds()).toEqual(["work", "deleted", "health", "leisure"]));
  });

  it("sends a second move only once the first is saved", async () => {
    const saves: ((response: LifeAreaResponse) => void)[] = [];
    const update = vi.spyOn(lifeAreasApi, "update").mockImplementation(
      () =>
        new Promise((resolve) => {
          saves.push(resolve);
        }),
    );
    const { listedIds, move } = renderMove();

    move("leisure", 0);
    move("work", 2);

    await waitFor(() => expect(listedIds()).toEqual(["leisure", "health", "work", "deleted"]));
    expect(update).toHaveBeenCalledOnce();
    act(() => saves.at(0)?.({ lifeArea: leisure }));
    await waitFor(() => expect(update).toHaveBeenLastCalledWith({ id: "work", position: 2 }));
  });
});
