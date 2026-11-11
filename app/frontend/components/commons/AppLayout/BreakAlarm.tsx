import { useCurrentTimeLog } from "@/hooks/reactQuery/useCurrentTimeLogsApi";

import ActiveBreakAlarm from "./ActiveBreakAlarm";

const BreakAlarm = () => {
  const { data: timeLog } = useCurrentTimeLog();

  if (!timeLog?.currentBreak) return null;

  // Keyed so each break starts with the alarm state of the moment it appears.
  return (
    <ActiveBreakAlarm
      key={timeLog.currentBreak.id}
      currentBreak={timeLog.currentBreak}
      timeLogId={timeLog.id}
    />
  );
};

export default BreakAlarm;
