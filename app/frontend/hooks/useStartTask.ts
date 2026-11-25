import { useState } from "react";

import { useNavigate } from "react-router";

import type { TimeLog } from "@/apis/types";
import type { TimerLocationState } from "@/components/Timer/types";
import { useCurrentTimeLog } from "@/hooks/reactQuery/useCurrentTimeLogsApi";
import routes from "@/routes";

// Opens the Timer with a task picked. With another session on the clock, it first asks how to wrap that one up: render
// `SwitchSessionDialog` with `switchDialogProps` while they're set. With this task on the clock, it just leads to it.
// Call it from a component that outlasts the dialog: ending a session refetches the task lists, and a row that leaves
// its list would take the dialog, and its success callback, with it.
const useStartTask = () => {
  const navigate = useNavigate();
  const { data: timeLog, isPending } = useCurrentTimeLog();
  // The session to switch from, kept while the dialog is open: ending it refetches the current time log as null, and
  // the dialog must stay mounted for its success callback to lead on to the Timer.
  const [switching, setSwitching] = useState<{ timeLog: TimeLog; taskId: string } | null>(null);

  const openTimer = (taskId: string) => {
    const state: TimerLocationState = { taskId };
    navigate(routes.timer, { state });
  };

  const startTask = (taskId: string) => {
    if (timeLog?.taskId === taskId) navigate(routes.timer);
    else if (timeLog) setSwitching({ timeLog, taskId });
    else openTimer(taskId);
  };

  const switchDialogProps = switching && {
    timeLog: switching.timeLog,
    onClose: () => setSwitching(null),
    onSwitch: () => openTimer(switching.taskId),
  };

  return {
    startTask,
    isLoadingSession: isPending,
    runningTaskId: timeLog?.taskId ?? null,
    switchDialogProps,
  };
};

export default useStartTask;
