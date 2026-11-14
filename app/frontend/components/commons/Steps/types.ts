export type StepItem = { id: string; text: string; isDone: boolean };

// Steps are named by id; a move gives the index the step lands on. An add without an index goes last. The new step row
// is held by the caller, since the button that opens the first one sits outside the list.
export type StepsProps = {
  steps: StepItem[];
  draft: Draft | null;
  onDraftChange: (draft: Draft | null) => void;
  onAdd: (text: string, index?: number) => void;
  onRename: (id: string, text: string) => void;
  onToggle: (id: string, isDone: boolean) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, toIndex: number) => void;
};

// A step row that hasn't been saved yet. Without an index it stays last, even while steps above it are still being
// added.
export type Draft = { key: number; index?: number };
