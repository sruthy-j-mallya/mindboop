import { useEffect, useState } from "react";

import { useLocation } from "react-router";

import type { Break } from "@/apis/types";
import BreakBanner from "@/components/commons/BreakBanner";
import routes from "@/routes";
import { startAlarmSound, unlockAlarmSound } from "@/utils/alarmSound";
import { showNotification } from "@/utils/notifications";

import { ALARM_PHASES } from "./constants";
import { getAlarmPhase, getNextAlarmChange } from "./utils";

type ActiveBreakAlarmProps = { currentBreak: Break; timeLogId: string };

const ActiveBreakAlarm = ({ currentBreak, timeLogId }: ActiveBreakAlarmProps) => {
  const { id, intention, endsAt } = currentBreak;
  const { pathname } = useLocation();
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
    window.addEventListener("pointerdown", unlockAlarmSound);
    window.addEventListener("keydown", unlockAlarmSound);

    return () => {
      window.removeEventListener("pointerdown", unlockAlarmSound);
      window.removeEventListener("keydown", unlockAlarmSound);
    };
  }, []);

  useEffect(() => {
    if (!isRinging) return undefined;

    return startAlarmSound();
  }, [isRinging]);

  useEffect(() => {
    if (!isQuiet || wasQuietOnMount) return undefined;

    const notification = showNotification({
      tag: id,
      title: "Break's over",
      body: `Time to come back: ${intention}`,
    });

    return () => notification?.close();
  }, [isQuiet, wasQuietOnMount, id, intention]);

  const isOnTimerPage = pathname === routes.timer;
  if (phase === ALARM_PHASES.WAITING || isOnTimerPage) return null;

  return (
    <div className="px-4 pb-4">
      <BreakBanner currentBreak={currentBreak} timeLogId={timeLogId} />
    </div>
  );
};

export default ActiveBreakAlarm;
