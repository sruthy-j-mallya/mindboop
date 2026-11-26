import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { LifeArea, Task, TaskFilters } from "@/apis/types";

export type ArchiveListProps = {
  title: string;
  icon: LucideIcon;
  filters: TaskFilters;
  emptyTitle: string;
  emptyHint: string;
  // Why a task couldn't be brought back.
  error?: string;
  renderTask: (task: Task, lifeArea?: LifeArea) => ReactNode;
};

export type ArchiveRowProps = {
  task: Task;
  // Its area, which may have been deleted since.
  lifeArea?: LifeArea;
  actionLabel: string;
  isBusy: boolean;
  // Given the name of the area it was in, or the Inbox.
  onAction: (task: Task, listName: string) => void;
};
