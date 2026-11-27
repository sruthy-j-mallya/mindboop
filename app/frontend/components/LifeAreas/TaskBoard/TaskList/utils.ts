import type { Task } from "@/apis/types";
import { getScheduleTone } from "@/components/commons/ScheduleLabel/utils";

import { TASK_GROUPS } from "./constants";
import type { TaskGroup, TaskGroupId } from "./types";

const getGroupId = (task: Task, now: number): TaskGroupId =>
  task.startsAt ? getScheduleTone(task, now) : "undated";

// The tasks by when they're due, keeping their order. Groups with none are left out.
export const groupTasks = (tasks: Task[], now: number): TaskGroup[] =>
  TASK_GROUPS.map((group) => ({
    ...group,
    tasks: tasks.filter((task) => getGroupId(task, now) === group.id),
  })).filter((group) => group.tasks.length > 0);
