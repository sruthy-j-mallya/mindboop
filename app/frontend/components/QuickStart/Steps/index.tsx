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
import { type Control, useFieldArray } from "react-hook-form";

import type { QuickStartFormValues } from "../constants";
import AddStep from "./AddStep";
import Step from "./Step";
import { STEP_ANNOUNCEMENTS } from "./utils";

type StepsProps = { control: Control<QuickStartFormValues> };

const Steps = ({ control }: StepsProps) => {
  const { fields, append, move, remove } = useFieldArray({ control, name: "steps" });
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const indexOf = (id: string | number) => fields.findIndex((field) => field.id === id);
    move(indexOf(active.id), indexOf(over.id));
  };

  // Focus stays on the add input so several steps can be typed in a row.
  const handleAdd = (text: string) => append({ text, isDone: false }, { shouldFocus: false });

  // The focused button goes away with its row, and the add button is the one control that always remains.
  const handleRemove = (index: number) => {
    addButtonRef.current?.focus();
    remove(index);
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
        <SortableContext items={fields} strategy={verticalListSortingStrategy}>
          <ul aria-label="Steps" className="flex flex-col gap-1 empty:hidden">
            {fields.map(({ id }, index) => (
              <Step key={id} control={control} id={id} index={index} onRemove={handleRemove} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <AddStep buttonRef={addButtonRef} onAdd={handleAdd} />
    </>
  );
};

export default Steps;
