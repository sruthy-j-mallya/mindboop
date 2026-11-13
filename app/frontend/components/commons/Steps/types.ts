export type StepItem = { id: string; text: string; isDone: boolean };

// Steps are named by id; a move gives the index the step lands on.
export type StepsProps = {
  steps: StepItem[];
  onAdd: (text: string) => void;
  onRename: (id: string, text: string) => void;
  onToggle: (id: string, isDone: boolean) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, toIndex: number) => void;
};
