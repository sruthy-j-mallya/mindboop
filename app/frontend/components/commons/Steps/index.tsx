import { useRef } from "react";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";

import DraftStep from "./DraftStep";
import Step from "./Step";
import type { StepsProps } from "./types";
import { STEP_ANNOUNCEMENTS } from "./utils";

// Only shows the steps and reports changes; the caller decides where they're kept (form state or the API).
const Steps = ({ steps, draft, onDraftChange, onAdd, onRename, onToggle, onRemove, onMove }: StepsProps) => {
  const listRef = useRef<HTMLUListElement>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    onMove(
      String(active.id),
      steps.findIndex((step) => step.id === over.id),
    );
  };

  // The focused button goes away with its row, so focus moves to the next step's tick (or the one before it).
  const handleRemove = (id: string) => {
    const index = steps.findIndex((step) => step.id === id);
    const neighbour = steps.at(index + 1) ?? (index > 0 ? steps.at(index - 1) : undefined);
    if (neighbour) {
      listRef.current
        ?.querySelector<HTMLElement>(`[data-step-id="${CSS.escape(neighbour.id)}"] [role="checkbox"]`)
        ?.focus();
    }
    onRemove(id);
  };

  // Each draft gets a new key, so the row after a saved one mounts afresh and takes the focus.
  const openDraft = (index?: number) => onDraftChange({ key: (draft?.key ?? 0) + 1, index });

  const handleDraftSave = (text: string) => {
    onAdd(text, draft?.index);
    onDraftChange(null);
  };

  // The saved step takes the draft's place, so the next draft goes one below it (or stays last).
  const handleDraftSaveAndContinue = (text: string) => {
    onAdd(text, draft?.index);
    openDraft(draft?.index === undefined ? undefined : draft.index + 1);
  };

  const handleInsertBelow = (id: string) => openDraft(steps.findIndex((step) => step.id === id) + 1);

  const rows = steps.map((step) => (
    <Step
      key={step.id}
      {...step}
      onInsertBelow={handleInsertBelow}
      onRemove={handleRemove}
      onRename={onRename}
      onToggle={onToggle}
    />
  ));
  const rowsWithDraft = draft
    ? rows.toSpliced(
        draft.index ?? rows.length,
        0,
        <DraftStep
          key={`draft-${draft.key}`}
          onDiscard={() => onDraftChange(null)}
          onSave={handleDraftSave}
          onSaveAndContinue={handleDraftSaveAndContinue}
        />,
      )
    : rows;

  return (
    <DndContext
      accessibility={{ announcements: STEP_ANNOUNCEMENTS }}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={steps} strategy={verticalListSortingStrategy}>
        <ul ref={listRef} aria-label="Steps" className="flex flex-col gap-1 empty:hidden">
          {rowsWithDraft}
        </ul>
      </SortableContext>
    </DndContext>
  );
};

export default Steps;
