import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import checklistItemsApi from "@/apis/checklist_items";
import type { Task, TaskResponse } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";

import { useCreateChecklistItem, useUpdateChecklistItem } from "./useChecklistItemsApi";

const TASK = { id: "task", checklistItems: [{ id: "first", title: "First", isCompleted: false }] } as Task;

describe("useChecklistItemsApi", () => {
  afterEach(() => vi.restoreAllMocks());

  it("shows changes at once, but sends them one at a time, in the order made", async () => {
    const answer = vi.fn();
    const create = vi.spyOn(checklistItemsApi, "create").mockReturnValueOnce(
      new Promise<TaskResponse>((resolve) => {
        answer.mockImplementation(() => resolve({ task: TASK }));
      }),
    );
    const update = vi.spyOn(checklistItemsApi, "update").mockResolvedValue({ task: TASK });
    const queryClient = new QueryClient();
    queryClient.setQueryData(QUERY_KEYS.TASKS.DETAIL(TASK.id), TASK);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(
      () => ({ create: useCreateChecklistItem(), update: useUpdateChecklistItem() }),
      { wrapper },
    );
    const titles = () =>
      queryClient
        .getQueryData<Task>(QUERY_KEYS.TASKS.DETAIL(TASK.id))
        ?.checklistItems.map(({ title }) => title);

    act(() => result.current.create.mutate({ taskId: TASK.id, title: "Second", position: 1 }));
    await waitFor(() => expect(create).toHaveBeenCalled());
    act(() => result.current.update.mutate({ taskId: TASK.id, id: "first", position: 1 }));

    await waitFor(() => expect(titles()).toEqual(["Second", "First"]));
    expect(update).not.toHaveBeenCalled();

    act(() => {
      answer();
    });

    await waitFor(() => expect(update).toHaveBeenCalled());
  });
});
