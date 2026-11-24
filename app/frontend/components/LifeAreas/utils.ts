import type { TaskCount } from "@/apis/types";

// The count for an area, or for the Inbox (null).
export const getTasksCount = (taskCounts: TaskCount[], lifeAreaId: string | null) =>
  taskCounts.find((taskCount) => taskCount.lifeAreaId === lifeAreaId)?.tasksCount ?? 0;

export const getTasksCountLabel = (count: number) => (count === 1 ? "1 task" : `${count} tasks`);

export const getAddAreasLabel = (count: number) => {
  if (count === 0) return "Add areas";

  return count === 1 ? "Add 1 area" : `Add ${count} areas`;
};
