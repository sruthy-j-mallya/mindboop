import { useLocation } from "react-router";

import type { Break } from "@/apis/types";
import BreakBanner from "@/components/commons/BreakBanner";
import routes from "@/routes";

import { ALARM_PHASES } from "./constants";
import useAlarm from "./useAlarm";

type ActiveBreakAlarmProps = { currentBreak: Break; timeLogId: string };

const ActiveBreakAlarm = ({ currentBreak, timeLogId }: ActiveBreakAlarmProps) => {
  const { id, intention, endsAt } = currentBreak;
  const { pathname } = useLocation();
  const phase = useAlarm(endsAt, { tag: id, title: "Break's over", body: `Time to come back: ${intention}` });

  const isOnTimerPage = pathname === routes.timer;
  if (phase === ALARM_PHASES.WAITING || isOnTimerPage) return null;

  return (
    <div className="px-4 pb-4">
      <BreakBanner currentBreak={currentBreak} timeLogId={timeLogId} />
    </div>
  );
};

export default ActiveBreakAlarm;
