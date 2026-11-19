import type { TimeLog } from "@/apis/types";
import { useTask } from "@/hooks/reactQuery/useTasksApi";
import useCurrentTime from "@/hooks/useCurrentTime";

import { describeSession } from "./utils";

type RunningSessionProps = { timeLog: TimeLog };

// The session on the clock: its task or routine and how far along it is, ticking while it runs.
const RunningSession = ({ timeLog }: RunningSessionProps) => {
  const { data: task } = useTask(timeLog.taskId ?? "", { enabled: !!timeLog.taskId });
  const currentTime = useCurrentTime(timeLog.isRunning);

  return (
    <section aria-label="Running session" className="grid gap-1 rounded-xl border bg-muted/40 p-4">
      <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">On the clock</p>
      <p className="font-semibold wrap-anywhere">{task?.title ?? timeLog.routineTitle ?? "…"}</p>
      <p className="text-sm text-muted-foreground tabular-nums" role="timer">
        {describeSession(timeLog, currentTime)}
      </p>
    </section>
  );
};

export default RunningSession;
