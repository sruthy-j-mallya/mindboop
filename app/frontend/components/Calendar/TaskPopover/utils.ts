import type { CreateTaskPayload } from "@/apis/types";
import type { Schedule } from "@/components/commons/ScheduleLabel/types";
import type { SchedulePayload } from "@/components/commons/SchedulePicker/types";

import { INITIAL_FORM_VALUES, type TaskFormValues } from "./constants";

// The schedule picker leaves out fields it doesn't change; the form keeps all four.
export const toSchedule = ({ isDuration, isAllDay, startsAt, endsAt }: SchedulePayload): Schedule => ({
  isDuration: isDuration ?? false,
  isAllDay: isAllDay ?? false,
  startsAt: startsAt ?? null,
  endsAt: endsAt ?? null,
});

export const getNewTaskFormValues = (schedule: Schedule): TaskFormValues => ({
  ...INITIAL_FORM_VALUES,
  schedule,
});

export const buildCreatePayload = ({
  title,
  description,
  estimatedMinutes,
  schedule,
  steps,
}: TaskFormValues): CreateTaskPayload => ({
  title,
  ...(description && { description }),
  estimatedMinutes,
  ...schedule,
  checklistItemsAttributes: steps.map(({ text, isDone }) => ({ title: text, isCompleted: isDone })),
});
