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

import AddStep from "./AddStep";
import Step from "./Step";
import type { StepsProps } from "./types";
import { STEP_ANNOUNCEMENTS } from "./utils";

// Only shows the steps and reports changes; the caller decides where they're kept (form state or the API).
const Steps = ({ steps, onAdd, onRename, onToggle, onRemove, onMove }: StepsProps) => {
  const addButtonRef = useRef<HTMLButtonElement>(null);
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

  // The focused button goes away with its row, and the add button is the one control that always remains.
  const handleRemove = (id: string) => {
    addButtonRef.current?.focus();
    onRemove(id);
  };

  return (
    <>
      <DndContext
        accessibility={{ announcements: STEP_ANNOUNCEMENTS }}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={steps} strategy={verticalListSortingStrategy}>
          <ul aria-label="Steps" className="flex flex-col gap-1 empty:hidden">
            {steps.map((step) => (
              <Step key={step.id} {...step} onRemove={handleRemove} onRename={onRename} onToggle={onToggle} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <AddStep buttonRef={addButtonRef} onAdd={onAdd} />
    </>
  );
};

export default Steps;
