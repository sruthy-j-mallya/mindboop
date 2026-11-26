import type { ReactNode } from "react";

import type { Task } from "@/apis/types";

export type TaskListProps = {
  // Not set until the lists first load.
  tasks?: Task[];
};

export type TaskCardProps = TaskListProps & {
  title: string;
  // Makes the title a link.
  titlePath?: string;
  emptyMessage: string;
  renderTask: (task: Task) => ReactNode;
};

export type TaskRowProps = {
  task: Task;
  // Shown between the checkbox and the title.
  leading?: ReactNode;
  // Shown under the title.
  details?: ReactNode;
  // Shown at the end of the row.
  children?: ReactNode;
  error?: string;
};

// A row with a button that starts its task.
export type StartableRowProps = {
  task: Task;
  isOnTheClock: boolean;
  isDisabled: boolean;
  onStart: (taskId: string) => void;
};
