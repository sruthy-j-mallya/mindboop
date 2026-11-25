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
  // Shown under the title.
  details?: ReactNode;
  // Shown at the end of the row.
  children?: ReactNode;
  error?: string;
};

export type ResumableRowProps = {
  task: Task;
  isOnTheClock: boolean;
  isDisabled: boolean;
  onResume: (taskId: string) => void;
};
