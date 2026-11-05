import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "cn";
import { GripVertical } from "lucide-react";
import { type Control, useController } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import type { QuickStartFormValues } from "../constants";

type StepProps = {
  control: Control<QuickStartFormValues>;
  id: string;
  index: number;
  text: string;
};

const Step = ({ control, id, index, text }: StepProps) => {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const {
    field: { value: isDone, onChange: setIsDone },
  } = useController({ control, name: `steps.${index}.isDone` });

  const handleCheckedChange = (checked: boolean | "indeterminate") => setIsDone(checked === true);

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 rounded-md bg-card py-1",
        isDragging && "relative z-10 shadow-md",
      )}
    >
      <Button
        aria-label={`Reorder ${text}`}
        className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        size="icon-sm"
        type="button"
        variant="ghost"
        {...attributes}
        {...listeners}
      >
        <GripVertical />
      </Button>
      <Checkbox
        checked={isDone}
        className="border-muted-foreground/50"
        id={`step-${id}`}
        onCheckedChange={handleCheckedChange}
      />
      <Label className="min-w-0 font-normal break-words" htmlFor={`step-${id}`}>
        {text}
      </Label>
    </li>
  );
};

export default Step;
