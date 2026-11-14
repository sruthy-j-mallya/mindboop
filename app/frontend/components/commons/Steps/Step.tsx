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

type StepProps = StepItem &
  Pick<StepsProps, "onRename" | "onToggle" | "onRemove"> & { onInsertBelow: (id: string) => void };

const Step = ({ id, text, isDone, onRename, onToggle, onRemove, onInsertBelow }: StepProps) => {
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
      data-step-id={id}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "group flex items-center gap-2 rounded-md bg-card py-1",
        isDragging && "relative z-10 shadow-md",
      )}
    >
      {/* A narrow handle, so the steps sit near the left edge. It shows only while the row is hovered or has focus (or
          is being dragged), keeping its space so the row doesn't shift. Touch screens can't hover, so it always shows
          there. */}
      <Button
        aria-label={`Reorder ${text}`}
        className={cn(
          "-mr-1 w-4 shrink-0 cursor-grab touch-none text-muted-foreground opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 active:cursor-grabbing pointer-coarse:opacity-100",
          isDragging && "opacity-100",
        )}
        size="icon-xs"
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
        <EditStep
          text={text}
          onContinue={() => onInsertBelow(id)}
          onDismiss={handleDismiss}
          onSave={handleSave}
        />
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
