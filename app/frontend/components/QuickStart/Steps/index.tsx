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
import { getAnnouncements } from "./utils";

type StepsProps = { control: Control<QuickStartFormValues> };

const Steps = ({ control }: StepsProps) => {
  const { fields, append, move } = useFieldArray({ control, name: "steps" });
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

  return (
    <>
      <DndContext
        accessibility={{ announcements: getAnnouncements(fields) }}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={fields} strategy={verticalListSortingStrategy}>
          <ul aria-label="Steps" className="flex flex-col gap-1 empty:hidden">
            {fields.map(({ id, text }, index) => (
              <Step key={id} control={control} id={id} index={index} text={text} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <AddStep onAdd={handleAdd} />
    </>
  );
};

export default Steps;
