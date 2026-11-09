import type { CreateTaskPayload, CreateTimeLogPayload, Task } from "@/apis/types";

import { isValidCustomMinutes, type QuickStartFormValues } from "./constants";

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

const MINUTES_PER_HOUR = 60;

export const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const rest = minutes % MINUTES_PER_HOUR;

  if (hours === 0) return `${rest} min`;

  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
};

// Only an hour or more needs converting, and only a time the form accepts is worth echoing back.
export const getCustomMinutesHint = (customMinutes: string) => {
  const minutes = Number(customMinutes);

  if (!isValidCustomMinutes(customMinutes) || minutes < MINUTES_PER_HOUR) return undefined;

  return `That's ${formatMinutes(minutes)}`;
};
