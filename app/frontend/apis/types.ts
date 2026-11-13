export type User = { id: string; emailAddress: string };

export type UserResponse = { user: User };

export type LoginPayload = { emailAddress: string; password: string };

export type SignupPayload = { token: string; password: string; passwordConfirmation: string };

export type RequestResetPayload = { emailAddress: string };

export type ResetPasswordPayload = { token: string; password: string; passwordConfirmation: string };

export type RequestEmailConfirmationPayload = { emailAddress: string };

export type ChecklistItem = { id: string; title: string; isCompleted: boolean };

export type Task = {
  id: string;
  title: string;
  description: string | null;
  estimatedMinutes: number | null;
  isDuration: boolean;
  isAllDay: boolean;
  isCompleted: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
  checklistItems: ChecklistItem[];
};

export type TaskListParams = { page?: number };

export type TaskListResponse = { tasks: Task[]; tasksCount: number; page: number; totalPages: number };

export type TaskResponse = { task: Task };

type TaskFields = Pick<Task, "title"> &
  Partial<
    Pick<
      Task,
      "description" | "estimatedMinutes" | "isDuration" | "isAllDay" | "isCompleted" | "startsAt" | "endsAt"
    >
  >;

export type ChecklistItemPayload = Pick<ChecklistItem, "title"> & Partial<Pick<ChecklistItem, "isCompleted">>;

export type CreateTaskPayload = TaskFields & { checklistItemsAttributes?: ChecklistItemPayload[] };

export type UpdateTaskPayload = Partial<TaskFields> & Pick<Task, "id">;

export type TimeLogMode = "timer" | "stopwatch";

export type Break = { id: string; intention: string; durationMinutes: number; endsAt: string };

export type TimeLog = {
  id: string;
  taskId: string;
  mode: TimeLogMode;
  timerPreset: number | null;
  bufferMinutes: number;
  accumulatedElapsedSeconds: number;
  isRunning: boolean;
  currentRunStartedAt: string | null;
  startedAt: string;
  completedAt: string | null;
  isFinishedEarly: boolean;
  currentBreak: Break | null;
  createdAt: string;
  updatedAt: string;
};

export type TimeLogResponse = { timeLog: TimeLog };

export type CreateTimeLogPayload = Pick<TimeLog, "taskId" | "mode"> & Partial<Pick<TimeLog, "timerPreset">>;

export type CreateQuickStartPayload = Pick<CreateTaskPayload, "title" | "checklistItemsAttributes"> &
  Partial<Pick<Task, "description">> & { estimatedMinutes: number };

export type QuickStartResponse = TaskResponse & TimeLogResponse;

export type CreateBreakPayload = Pick<Break, "intention" | "durationMinutes"> & { timeLogId: string };

export type ExtendTimeLogPayload = { timeLogId: string; minutes: number };

export type CreateBailOutPayload = {
  timeLogId: string;
  completedDescription: string;
  restartDescription: string;
};

export type CurrentTimeLogResponse = { timeLog: TimeLog | null };

// `position` is the index the item lands on among the task's steps; without it, a new item goes last.
export type CreateChecklistItemPayload = Pick<ChecklistItem, "title"> & { taskId: string; position?: number };

export type UpdateChecklistItemPayload = Partial<Pick<ChecklistItem, "title" | "isCompleted">> & {
  taskId: string;
  id: string;
  position?: number;
};

export type DeleteChecklistItemPayload = { taskId: string; id: string };
