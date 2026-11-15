import type { CreateTaskPayload, Task, UpdateTaskPayload } from "@/apis/types";
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

export const toFormValues = (task: Task): TaskFormValues => ({
  title: task.title,
  description: task.description ?? "",
  estimatedMinutes: task.estimatedMinutes,
  schedule: toSchedule(task),
  steps: [],
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

const isSameSchedule = (schedule: Schedule, other: Schedule) =>
  schedule.isDuration === other.isDuration &&
  schedule.isAllDay === other.isAllDay &&
  schedule.startsAt === other.startsAt &&
  schedule.endsAt === other.endsAt;

// Only what changed from the saved task, so closing an untouched popover saves nothing. The form trims the title and
// description, so they're compared trimmed too.
export const buildUpdatePayload = (task: Task, values: TaskFormValues): UpdateTaskPayload | null => {
  const saved = toFormValues(task);
  const { title, description, estimatedMinutes, schedule } = values;
  const payload: UpdateTaskPayload = {
    id: task.id,
    ...(title !== saved.title.trim() && { title }),
    ...(description !== saved.description.trim() && { description }),
    ...(estimatedMinutes !== saved.estimatedMinutes && { estimatedMinutes }),
    ...(!isSameSchedule(schedule, saved.schedule) && schedule),
  };

  return Object.keys(payload).length > 1 ? payload : null;
};
