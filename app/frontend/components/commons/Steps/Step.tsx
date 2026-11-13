import { useRef, useState } from "react";
import { flushSync } from "react-dom";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "cn";
import { GripVertical, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import EditStep from "./EditStep";
import type { StepItem, StepsProps } from "./types";

type StepProps = StepItem & Pick<StepsProps, "onRename" | "onToggle" | "onRemove">;

const Step = ({ id, text, isDone, onRename, onToggle, onRemove }: StepProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const textButtonRef = useRef<HTMLButtonElement>(null);
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id,
    data: { text },
  });

  const handleCheckedChange = (checked: boolean | "indeterminate") => onToggle(id, checked === true);

  // A step can't go blank, so an emptied draft leaves the old text in place. Unchanged text isn't saved again.
  const handleSave = (newText: string) => {
    if (newText && newText !== text) onRename(id, newText);
    setIsEditing(false);
  };

  // The input unmounts with the focus inside it, so the step text has to render before taking it back.
  const handleDismiss = () => {
    flushSync(() => setIsEditing(false));
    textButtonRef.current?.focus();
  };

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
        aria-label={text}
        checked={isDone}
        className="border-muted-foreground/50"
        onCheckedChange={handleCheckedChange}
      />
      {isEditing ? (
        <EditStep text={text} onDismiss={handleDismiss} onSave={handleSave} />
      ) : (
        <Button
          ref={textButtonRef}
          aria-label={`Edit ${text}`}
          className="h-auto min-h-8 min-w-0 flex-1 cursor-text justify-start border border-transparent px-3 py-1 text-left font-normal break-words whitespace-normal"
          type="button"
          variant="ghost"
          onClick={() => setIsEditing(true)}
        >
          <span className="min-w-0">{text}</span>
        </Button>
      )}
      <Button
        aria-label={`Remove ${text}`}
        className="text-muted-foreground"
        size="icon-sm"
        type="button"
        variant="ghost"
        onClick={() => onRemove(id)}
      >
        <Trash2 />
      </Button>
    </li>
  );
};

export default Step;
