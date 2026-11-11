import { ALARM_PHASES, ALARM_RING_DURATION, SIDEBAR_STORAGE_KEY } from "./constants";

export const isSidebarOpen = () => {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  } catch {
    // Storage can be blocked; the sidebar starts collapsed.
    return false;
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
