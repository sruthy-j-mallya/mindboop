import type { LifeArea, Task } from "@/apis/types";

export type ResultProps = {
  id: string;
  task: Task;
  lifeArea?: LifeArea;
  searchTerm: string;
  isActive: boolean;
  onHighlight: () => void;
  onPick: (task: Task) => void;
};
