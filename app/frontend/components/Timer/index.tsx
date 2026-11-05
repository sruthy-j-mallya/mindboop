import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { useCurrentTimeLog } from "@/hooks/reactQuery/useCurrentTimeLogsApi";
import routes from "@/routes";

import Session from "./Session";

const Timer = () => {
  const { data: timeLog, isPending, error } = useCurrentTimeLog();

  if (isPending) return null;

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
      {!error && timeLog && <Session key={timeLog.id} timeLog={timeLog} />}
      {!error && !timeLog && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <h1 className="text-2xl font-semibold">Nothing on the clock</h1>
          <Button asChild>
            <Link to={routes.root}>Start a session</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Timer;
