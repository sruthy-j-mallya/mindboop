import type { Day } from "date-fns";

import type { SoundId } from "@/components/commons/Ambience/types";
import type { LifeAreaColorId } from "@/components/commons/LifeArea/types";
import type { AlarmSoundId } from "@/utils/alarmSound/types";
import type { CompletionSoundId } from "@/utils/completionSound/types";

export type User = { id: string; emailAddress: string };

export type UserResponse = { user: User };

export type LoginPayload = { emailAddress: string; password: string };

export type SignupPayload = { token: string; password: string; passwordConfirmation: string };

export type RequestResetPayload = { emailAddress: string };

export type ResetPasswordPayload = { token: string; password: string; passwordConfirmation: string };

export type RequestEmailConfirmationPayload = { emailAddress: string };

export type ChecklistItem = { id: string; title: string; isCompleted: boolean };

// Left when a session is bailed out of: what got done (optional) and where to pick the task back up.
export type Breadcrumb = {
  id: string;
  completedDescription: string | null;
  restartDescription: string;
  createdAt: string;
};

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
  // The area of life it's in; without one, it's in the Inbox.
  lifeAreaId: string | null;
  createdAt: string;
  updatedAt: string;
  // When it was deleted; only a deleted task has it.
  discardedAt?: string;
  checklistItems: ChecklistItem[];
  breadcrumbs: Breadcrumb[];
};

// `searchTerm` matches any part of a title, ignoring case; `isSearchingDetails` has it match descriptions and
// checklist items too. `isInInbox` lists only tasks without an area, `lifeAreaId`
// only those in that area.
export type TaskFilters = {
  isCompleted?: boolean;
  // Only deleted tasks, which are otherwise left out.
  isDeleted?: boolean;
  searchTerm?: string;
  isSearchingDetails?: boolean;
  isInInbox?: boolean;
  lifeAreaId?: string;
};

export type TaskListParams = TaskFilters & { page?: number };

export type TaskListResponse = { tasks: Task[]; tasksCount: number; page: number; totalPages: number };

export type TaskResponse = { task: Task };

// The tasks left to do in an area of life, or in the Inbox (`lifeAreaId` is null). Those with none are left out.
export type TaskCount = { lifeAreaId: string | null; tasksCount: number };

export type TaskCountListResponse = { taskCounts: TaskCount[] };

// The bounds of the user's day: its start and the next one's.
export type HomeTasksParams = { from: string; to: string };

// The Home page's lists of open tasks. `today` and `overdue` never share one; `resumable` can repeat either's.
export type HomeTasksResponse = { today: Task[]; overdue: Task[]; resumable: Task[] };

type TaskFields = Pick<Task, "title"> &
  Partial<
    Pick<
      Task,
      | "description"
      | "estimatedMinutes"
      | "isDuration"
      | "isAllDay"
      | "isCompleted"
      | "startsAt"
      | "endsAt"
      | "lifeAreaId"
    >
  >;

export type ChecklistItemPayload = Pick<ChecklistItem, "title"> & Partial<Pick<ChecklistItem, "isCompleted">>;

export type CreateTaskPayload = TaskFields & { checklistItemsAttributes?: ChecklistItemPayload[] };

export type UpdateTaskPayload = Partial<TaskFields> & Pick<Task, "id">;

// The modes a session can be started in, on the Timer.
export type StartableTimeLogMode = "timer" | "stopwatch";

// A manual log is a session saved after the fact, from the Calendar; it never runs.
export type TimeLogMode = StartableTimeLogMode | "manual";

export type Break = { id: string; intention: string; durationMinutes: number; endsAt: string };

// A manual log can go without a task (it then has a `title` of its own), and so can a session on a routine.
// `taskTitle` and `routineTitle` are its task's and routine's titles.
export type TimeLog = {
  id: string;
  taskId: string | null;
  routineId: string | null;
  title: string | null;
  taskTitle: string | null;
  routineTitle: string | null;
  // Its task's area of life, which the Calendar colours it by.
  lifeAreaId: string | null;
  // The work still counts once its task is deleted, but the task can't be opened.
  isTaskDeleted: boolean;
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

// A session runs on a task, or on a routine (a timer for the routine's duration unless `timerPreset` says otherwise).
export type StartTimeLogPayload = {
  mode: StartableTimeLogMode;
  timerPreset?: number | null;
} & ({ taskId: string; routineId?: never } | { routineId: string; taskId?: never });

// A session that already happened, linked to a task or a routine, or saved with only a title.
export type LogTimePayload = { mode: "manual"; startedAt: string; completedAt: string } & (
  | { taskId: string; title?: never; routineId?: never }
  | { title: string; taskId?: never; routineId?: never }
  | { routineId: string; taskId?: never; title?: never }
);

export type CreateTimeLogPayload = StartTimeLogPayload | LogTimePayload;

// Moves a finished session, as when it's dragged on the Calendar.
export type UpdateTimeLogPayload = Pick<TimeLog, "id" | "startedAt"> & { completedAt: string };

export type CalendarEventsParams = { from: string; to: string };

export type CalendarEventsResponse = { tasks: Task[]; timeLogs: TimeLog[] };

export type CreateQuickStartPayload = Pick<CreateTaskPayload, "title" | "checklistItemsAttributes"> &
  Partial<Pick<Task, "description">> & { estimatedMinutes: number };

export type QuickStartResponse = TaskResponse & TimeLogResponse;

export type CreateBreakPayload = Pick<Break, "intention" | "durationMinutes"> & { timeLogId: string };

export type ExtendTimeLogPayload = { timeLogId: string; minutes: number };

// `discardOverrun` logs a timer that ran past zero at its planned time, leaving the extra time out.
export type EndTimeLogOptions = { discardOverrun?: boolean };

export type CreateCompletionPayload = EndTimeLogOptions & { timeLogId: string };

export type CreateBailOutPayload = EndTimeLogOptions & {
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

export type Theme = "system" | "light" | "dark";

// The day the Calendar's weeks start on: 0 is Sunday and 6 Saturday, as date-fns numbers them.
export type WeekStartsOn = Day;

// The 12-hour ("5:30pm") or 24-hour ("17:30") clock.
export type TimeFormat = "12h" | "24h";

export type UserPreference = {
  theme: Theme;
  completionSound: CompletionSoundId;
  breakAlarmSound: AlarmSoundId;
  weekStartsOn: WeekStartsOn;
  timeFormat: TimeFormat;
};

// How dates and times read.
export type DatePreferences = Pick<UserPreference, "weekStartsOn" | "timeFormat">;

export type UserPreferenceResponse = { userPreference: UserPreference };

export type UpdateUserPreferencePayload = Partial<UserPreference>;

// Parked until dealt with: addressed by hand, or converted into an Inbox task (then `taskId` is set).
export type ParkingLotItemStatus = "parked" | "addressed" | "converted";

export type ParkingLotItem = {
  id: string;
  content: string;
  status: ParkingLotItemStatus;
  taskId: string | null;
  // The focus session it was parked during, if any.
  timeLogId: string | null;
  // Set while a curiosity time (a short timeboxed look-up) runs on the item; it can be extended once.
  curiosityEndsAt: string | null;
  isCuriosityExtended: boolean;
  createdAt: string;
  updatedAt: string;
};

// `timeLogId` lists only what was parked during that session.
export type ParkingLotItemFilters = { status?: ParkingLotItemStatus; timeLogId?: string };

export type ParkingLotItemListParams = ParkingLotItemFilters & { page?: number };

export type ParkingLotItemListResponse = {
  parkingLotItems: ParkingLotItem[];
  parkingLotItemsCount: number;
  page: number;
  totalPages: number;
};

export type ParkingLotItemResponse = { parkingLotItem: ParkingLotItem };

export type CreateParkingLotItemPayload = Pick<ParkingLotItem, "content"> &
  Partial<Pick<ParkingLotItem, "timeLogId">>;

export type UpdateParkingLotItemPayload = Pick<ParkingLotItem, "id"> &
  Partial<Pick<ParkingLotItem, "content" | "status">>;

// The task's schedule is optional; without one the task lands in the Inbox undated.
export type ConvertParkingLotItemPayload = { parkingLotItemId: string } & Partial<
  Pick<Task, "isDuration" | "isAllDay" | "startsAt" | "endsAt">
>;

// The user's running curiosity time, if any.
export type CuriosityTimeResponse = { parkingLotItem: ParkingLotItem | null };

// A part of life (Work, Health, …) that groups tasks. `defaultSound` is the background sound a session on one of its
// tasks starts with; "none" is silence.
export type LifeArea = {
  id: string;
  name: string;
  color: LifeAreaColorId;
  emoji: string;
  defaultSound: SoundId;
  // A deleted area keeps its completed tasks, so it's still shown on them.
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LifeAreaListResponse = { lifeAreas: LifeArea[] };

export type LifeAreaResponse = { lifeArea: LifeArea };

export type CreateLifeAreaPayload = Pick<LifeArea, "name" | "color" | "emoji" | "defaultSound">;

// `position` is the index the area lands on among the undeleted ones.
export type UpdateLifeAreaPayload = Partial<CreateLifeAreaPayload> &
  Pick<LifeArea, "id"> & { position?: number };

export type MoveLifeAreaPayload = Pick<LifeArea, "id"> & { position: number };

// `tasksLifeAreaId` is the area its uncompleted tasks move to; without one, they go to the Inbox.
export type DeleteLifeAreaPayload = Pick<LifeArea, "id"> & { tasksLifeAreaId?: string };

// A timer started again and again (a shower, meditation). `reminderTime` ("HH:MM", local time) and `reminderDays`
// (0 = Sunday … 6) set an optional reminder. The stats count its finished sessions.
export type Routine = {
  id: string;
  title: string;
  emoji: string;
  color: LifeAreaColorId;
  sound: SoundId;
  durationMinutes: number;
  reminderTime: string | null;
  reminderDays: number[];
  sessionsCount: number;
  totalSeconds: number;
  lastDoneAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RoutineListResponse = { routines: Routine[] };

export type RoutineResponse = { routine: Routine };

export type CreateRoutinePayload = Pick<
  Routine,
  "title" | "emoji" | "color" | "sound" | "durationMinutes" | "reminderTime" | "reminderDays"
>;

export type UpdateRoutinePayload = Partial<CreateRoutinePayload> & Pick<Routine, "id">;

export type RoutineTimeLogsParams = { routineId: string; from: string; to: string };

export type RoutineTimeLogsResponse = { timeLogs: TimeLog[] };

// The first steps a user has taken, for the checklist on Home.
export type Onboarding = { hasLifeAreas: boolean; hasTasks: boolean; hasSessions: boolean };

export type OnboardingResponse = { onboarding: Onboarding };
