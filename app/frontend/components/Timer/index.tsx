import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { useCurrentTimeLog } from "@/hooks/reactQuery/useCurrentTimeLogsApi";
import { useCompleteTimeLog } from "@/hooks/reactQuery/useTimeLogCompletionsApi";
import routes from "@/routes";

import FinishedDialog from "./FinishedDialog";
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
    <div className="mx-auto w-full max-w-2xl p-4">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
      {!error && timeLog && (
        <Session
          key={timeLog.id}
          completionError={completionError?.message}
          isCompleting={isCompleting}
          timeLog={timeLog}
          onDone={completeTimeLog}
        />
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
