import type { Task } from "@/apis/types";
import type { ScheduleTone } from "@/components/commons/ScheduleLabel/types";

export type TaskGroupId = ScheduleTone | "undated";

export type TaskGroup = { id: TaskGroupId; label: string; tasks: Task[] };
