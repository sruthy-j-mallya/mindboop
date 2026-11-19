import { generatePath } from "react-router";

import { MINUTES_PER_HOUR, SECONDS_PER_MINUTE } from "@/constants";
import routes from "@/routes";

type KeyTransform = (key: string) => string;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === "[object Object]";

const transformKeys = (value: unknown, transform: KeyTransform): unknown => {
  if (Array.isArray(value)) return value.map((item) => transformKeys(item, transform));

  if (!isPlainObject(value)) return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [transform(key), transformKeys(nested, transform)]),
  );
};

const toCamelCase: KeyTransform = (key) =>
  key.replace(/_([a-z0-9])/g, (_, char: string) => char.toUpperCase());

const toSnakeCase: KeyTransform = (key) => key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);

export const keysToCamelCase = <T>(value: unknown) => transformKeys(value, toCamelCase) as T;

export const keysToSnakeCase = <T>(value: unknown) => transformKeys(value, toSnakeCase) as T;

// Seconds until `endsAt` (a break's or a curiosity time's end). Rounds up, so it doesn't read as over during its last
// second.
export const getRemainingSeconds = (endsAt: string, currentTime: number) =>
  Math.max(Math.ceil((Date.parse(endsAt) - currentTime) / 1000), 0);

const pad = (value: number) => String(value).padStart(2, "0");

// "04:59".
export const formatRemainingTime = (remainingSeconds: number) => {
  const minutes = Math.floor(remainingSeconds / SECONDS_PER_MINUTE);

  return `${pad(minutes)}:${pad(remainingSeconds % SECONDS_PER_MINUTE)}`;
};

// "45 min", "2 h", "1 h 30 min".
export const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const rest = minutes % MINUTES_PER_HOUR;

  if (hours === 0) return `${rest} min`;

  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
};

// shadcn generates `import { cn } from "@/utils"` (see components.json); re-export the package so it resolves.
export { cn } from "cn";

// The task list a task opens beside: an area's, or the Inbox's for a task in no area.
export const getTaskListPath = (lifeAreaId?: string | null) =>
  lifeAreaId ? generatePath(routes.lifeAreas.show, { lifeAreaId }) : routes.inbox.index;

export const getTaskPath = (taskId: string, lifeAreaId?: string | null) =>
  lifeAreaId
    ? generatePath(routes.lifeAreas.task, { lifeAreaId, taskId })
    : generatePath(routes.inbox.show, { taskId });
