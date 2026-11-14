import { useCallback, useEffect, useId, useRef, useState } from "react";

import type { Task } from "@/apis/types";
import RichTextEditor from "@/components/commons/RichText/LazyEditor";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";

import { DESCRIPTION_SAVE_DELAY, DESCRIPTION_SCHEMA } from "./constants";

type TaskDescriptionProps = {
  task: Task;
  isAutoFocused?: boolean;
};

// The task's description, always editable and saved as you go (after a pause in typing, on blur, and on unmount),
// so it can sit on any screen or popover without a Save button. The editor is uncontrolled: render it with
// `key={task.id}` wherever the task can change under it.
const TaskDescription = ({ task: { id, description }, isAutoFocused = false }: TaskDescriptionProps) => {
  const errorId = useId();
  const { mutate: updateTask, error } = useUpdateTask();
  const [validationError, setValidationError] = useState<string>();
  // The latest valid edit not sent yet, and the last value sent (null once a save fails, so the next one retries).
  const pendingRef = useRef<string | null>(null);
  const lastSentRef = useRef<string | null>(description ?? "");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const flush = useCallback(() => {
    clearTimeout(timeoutRef.current);
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (pending === null || pending === lastSentRef.current) return;

    lastSentRef.current = pending;
    updateTask({ id, description: pending }, { onError: () => (lastSentRef.current = null) });
  }, [id, updateTask]);

  // Sends an edit still waiting on the timer when the description goes away (a popover closes, the page changes).
  useEffect(() => flush, [flush]);

  const handleChange = (markdown: string) => {
    clearTimeout(timeoutRef.current);
    const { success, data, error: parseError } = DESCRIPTION_SCHEMA.safeParse(markdown);
    setValidationError(parseError?.issues[0]?.message);
    pendingRef.current = success ? data : null;
    if (success) timeoutRef.current = setTimeout(flush, DESCRIPTION_SAVE_DELAY);
  };

  const errorMessage = validationError ?? error?.message;

  return (
    <section aria-label="Description" className="flex flex-col gap-2" onBlur={flush}>
      <RichTextEditor
        defaultValue={description ?? ""}
        describedBy={errorMessage ? errorId : undefined}
        isAutoFocused={isAutoFocused}
        isInvalid={!!validationError}
        label="Description"
        placeholder="Add a description: notes, links or context. Markdown works too."
        onChange={handleChange}
      />
      {errorMessage && (
        <p className="text-sm text-destructive" id={errorId} role="alert">
          {errorMessage}
        </p>
      )}
    </section>
  );
};

export default TaskDescription;
