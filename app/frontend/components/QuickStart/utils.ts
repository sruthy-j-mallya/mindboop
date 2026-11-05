import type { CreateTaskPayload, Task } from "@/apis/tasks";
import type { CreateTimeLogPayload } from "@/apis/time_logs";

import type { QuickStartFormValues } from "./constants";

export const buildTaskPayload = ({
  title,
  steps,
  presetMinutes,
  customMinutes,
}: QuickStartFormValues): CreateTaskPayload => ({
  title,
  estimatedMinutes: presetMinutes ?? Number(customMinutes),
  checklistItemsAttributes: steps.map(({ text, isDone }) => ({ title: text, isCompleted: isDone })),
});

export const buildTimeLogPayload = ({ id, estimatedMinutes }: Task): CreateTimeLogPayload => {
  const startedAt = new Date().toISOString();

  return {
    taskId: id,
    mode: "timer",
    timerPreset: estimatedMinutes,
    isRunning: true,
    startedAt,
    currentRunStartedAt: startedAt,
  };
};
