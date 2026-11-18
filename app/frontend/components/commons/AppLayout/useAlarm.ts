import { useEffect, useState } from "react";

import { useUserPreference } from "@/hooks/reactQuery/useUserPreferencesApi";
import { startAlarmSound } from "@/utils/alarmSound";
import { unlockAudio } from "@/utils/audioContext";
import { showNotification } from "@/utils/notifications";

import { ALARM_PHASES } from "./constants";
import type { AlarmNotification } from "./types";
import { getAlarmPhase, getNextAlarmChange } from "./utils";

// Rings when `endsAt` passes, then goes quiet and leaves a notification. Shared by breaks and curiosity times; the
// caller keys its component per alarm, so each one starts from the state of the moment it appears.
const useAlarm = (endsAt: string, { tag, title, body }: AlarmNotification) => {
  // Waits for the user's choice of alarm, but rings the default if it can't be loaded.
  const { data: preference, isPending: isPreferencePending } = useUserPreference();
  const alarmSound = preference?.breakAlarmSound;
  const [currentTime, setCurrentTime] = useState(Date.now);
  const phase = getAlarmPhase(endsAt, currentTime);
  const [wasQuietOnMount] = useState(phase === ALARM_PHASES.QUIET);
  const isRinging = phase === ALARM_PHASES.RINGING;
  const isQuiet = phase === ALARM_PHASES.QUIET;

  // One timer per phase change, because browsers throttle repeating timers harder in hidden tabs.
  useEffect(() => {
    const nextChange = getNextAlarmChange(endsAt, currentTime);
    if (nextChange === null) return undefined;

    const timeout = setTimeout(() => setCurrentTime(Date.now()), nextChange - Date.now());

    return () => clearTimeout(timeout);
  }, [endsAt, currentTime]);

  // Timers are late or paused after the computer sleeps, so check again on the way back.
  useEffect(() => {
    const handleWake = () => setCurrentTime(Date.now());

    document.addEventListener("visibilitychange", handleWake);
    window.addEventListener("focus", handleWake);

    return () => {
      document.removeEventListener("visibilitychange", handleWake);
      window.removeEventListener("focus", handleWake);
    };
  }, []);

  // A reload loses the permission to play sound until the next gesture.
  useEffect(() => {
    window.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("keydown", unlockAudio);

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  useEffect(() => {
    if (!isRinging || isPreferencePending) return undefined;

    return startAlarmSound(alarmSound);
  }, [isRinging, isPreferencePending, alarmSound]);

  useEffect(() => {
    if (!isQuiet || wasQuietOnMount) return undefined;

    const notification = showNotification({ tag, title, body });

    return () => notification?.close();
  }, [isQuiet, wasQuietOnMount, tag, title, body]);

  return phase;
};

export default useAlarm;
