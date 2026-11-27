import { matchPath } from "react-router";

import type { Routine, TimeLog } from "@/apis/types";
import routes from "@/routes";
import { formatRemainingTime } from "@/utils";
import { getClockState } from "@/utils/timeLogs";

import {
  ALARM_PHASES,
  ALARM_RING_DURATION,
  HOME_TITLE,
  PAGE_TITLES,
  REMINDER_GRACE_PERIOD,
  SIDEBAR_STORAGE_KEY,
  UNKNOWN_PAGE_TITLE,
  WIDE_LAYOUT_QUERY,
} from "./constants";

// As it was last left. Until then it starts open where there's room for its labels.
export const isSidebarOpen = () => {
  const isWide = window.matchMedia(WIDE_LAYOUT_QUERY).matches;

  try {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);

    return stored === null ? isWide : stored === "true";
  } catch {
    // Storage can be blocked.
    return isWide;
  }
};

export const saveSidebarOpen = (isOpen: boolean) => {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isOpen));
  } catch {
    // Storage can be blocked; the sidebar still toggles until the next reload.
  }
};

export const getAlarmPhase = (endsAt: string, currentTime: number) => {
  const ringingUntil = Date.parse(endsAt) + ALARM_RING_DURATION;

  if (currentTime < Date.parse(endsAt)) return ALARM_PHASES.WAITING;

  return currentTime < ringingUntil ? ALARM_PHASES.RINGING : ALARM_PHASES.QUIET;
};

export const getNextAlarmChange = (endsAt: string, currentTime: number) => {
  const phase = getAlarmPhase(endsAt, currentTime);

  if (phase === ALARM_PHASES.WAITING) return Date.parse(endsAt);

  return phase === ALARM_PHASES.RINGING ? Date.parse(endsAt) + ALARM_RING_DURATION : null;
};

// A reminder is due on one of its days, from its time until the grace period runs out, in the browser's time zone.
export const isReminderDue = (
  { reminderTime, reminderDays }: Pick<Routine, "reminderTime" | "reminderDays">,
  now: Date,
) => {
  if (!reminderTime || !reminderDays.includes(now.getDay())) return false;

  const [hours, minutes] = reminderTime.split(":").map(Number);
  const dueAt = new Date(now);
  dueAt.setHours(hours, minutes, 0, 0);
  const lateBy = now.getTime() - dueAt.getTime();

  return lateBy >= 0 && lateBy <= REMINDER_GRACE_PERIOD;
};

const findPageTitle = (pathname: string) =>
  pathname === routes.root
    ? HOME_TITLE
    : (PAGE_TITLES.find(({ path }) => matchPath({ path, end: false }, pathname))?.title ??
      UNKNOWN_PAGE_TITLE);

// "Calendar", or with a session on the clock "14:55 · Calendar", so the time shows from another tab.
export const getPageTitle = (pathname: string, timeLog: TimeLog | null | undefined, currentTime: number) => {
  const title = findPageTitle(pathname);
  if (!timeLog) return title;

  const clock = timeLog.currentBreak
    ? "Paused"
    : formatRemainingTime(getClockState(timeLog, currentTime).seconds);

  return `${clock} · ${title}`;
};

// The Inbox, the areas, and the completed and deleted tasks share one page, with a sidebar of their own.
export const isTasksPath = (pathname: string) =>
  [routes.inbox.index, routes.lifeAreas.index, routes.completedTasks, routes.deletedTasks].some((path) =>
    matchPath({ path, end: false }, pathname),
  );

// The page of the bottom bar a path belongs to: every list of tasks is under Tasks. Other pages, the Calendar and the
// timer among them, are under More.
export const findBottomBarPath = (pathname: string) => {
  if (isTasksPath(pathname)) return routes.inbox.index;

  return [routes.root, routes.routines.index, routes.parkingLot].find((path) =>
    matchPath({ path, end: path === routes.root }, pathname),
  );
};

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

// ⌘K, or Ctrl+K.
export const isSearchShortcut = ({ key, metaKey, ctrlKey, altKey, shiftKey }: KeyboardEvent) =>
  (metaKey || ctrlKey) && !altKey && !shiftKey && key.toLowerCase() === "k";

// ⌥N, or Alt+N. By its place on the keyboard, as ⌥N types "˜" on a Mac; so it's left alone while typing.
export const isCaptureShortcut = ({ code, altKey, metaKey, ctrlKey, shiftKey, target }: KeyboardEvent) =>
  altKey && !metaKey && !ctrlKey && !shiftKey && code === "KeyN" && !isTyping(target);
