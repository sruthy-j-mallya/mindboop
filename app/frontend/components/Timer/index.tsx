import { cn } from "cn";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { useCurrentTimeLog } from "@/hooks/reactQuery/useCurrentTimeLogsApi";
import { useCompleteTimeLog } from "@/hooks/reactQuery/useTimeLogCompletionsApi";
import routes from "@/routes";

import FinishedDialog from "./FinishedDialog";
import ParkingLot from "./ParkingLot";
import Session from "./Session";

const Timer = () => {
  const { data: timeLog, isPending, error } = useCurrentTimeLog();
  // Lives here and not in Session, which unmounts as soon as the completed log stops being the current one.
  const {
    mutate: completeTimeLog,
    data: completion,
    isPending: isCompleting,
    error: completionError,
    reset: resetCompletion,
  } = useCompleteTimeLog();

  if (isPending) return null;

  return (
    <div className={cn("mx-auto flex w-full max-w-5xl flex-1 flex-col p-4", timeLog && "xl:max-w-7xl")}>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
      {/* The parking lot sits beside the session on wide screens, and under it otherwise. */}
      {!error && timeLog && (
        <div className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <Session
            key={timeLog.id}
            completionError={completionError?.message}
            isCompleting={isCompleting}
            timeLog={timeLog}
            onDone={completeTimeLog}
          />
          <ParkingLot
            className="mx-auto h-[28rem] w-full max-w-2xl lg:max-w-5xl xl:sticky xl:top-4 xl:h-[calc(100svh-6rem)] xl:max-w-none xl:self-start"
            since={timeLog.startedAt}
          />
        </div>
      )}
      {!error && !timeLog && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <h1 className="text-2xl font-semibold">Nothing on the clock</h1>
          <Button asChild>
            <Link to={routes.root}>Start a session</Link>
          </Button>
        </div>
      )}
      {completion && (
        <FinishedDialog isFinishedEarly={completion.timeLog.isFinishedEarly} onClose={resetCompletion} />
      )}
    </div>
  );
};

export default Timer;
