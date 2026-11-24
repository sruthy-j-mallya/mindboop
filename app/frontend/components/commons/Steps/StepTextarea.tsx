import { cn } from "cn";
import type { ComponentProps } from "react";

import { Textarea } from "@/components/ui/textarea";

import { STEP_TEXT_CLASS_NAME } from "./constants";

type StepTextareaProps = Omit<ComponentProps<typeof Textarea>, "onChange"> & {
  onValueChange: (value: string) => void;
};

// Edits a step in place: it has the step text's box, padding and wrapping, without an input's border or focus ring, so
// clicking a step doesn't shift the row. It grows with the text, and a step stays on one line, so pasted line breaks
// become spaces (Enter is handled by the caller).
const StepTextarea = ({ className, onValueChange, ...props }: StepTextareaProps) => (
  <Textarea
    autoComplete="off"
    rows={1}
    className={cn(
      STEP_TEXT_CLASS_NAME,
      "resize-none border-transparent bg-accent shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-accent/50",
      className,
    )}
    onChange={(event) => onValueChange(event.target.value.replace(/[\r\n]+/g, " "))}
    {...props}
  />
);

export default StepTextarea;
