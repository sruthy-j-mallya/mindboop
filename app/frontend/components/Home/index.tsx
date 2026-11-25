import { format } from "date-fns";

import { useHomeTasks } from "@/hooks/reactQuery/useHomeTasksApi";
import useCurrentTime from "@/hooks/useCurrentTime";

import { DAY_REFRESH_INTERVAL } from "./constants";
import Overdue from "./Overdue";
import QuickStart from "./QuickStart";
import Resumable from "./Resumable";
import Today from "./Today";
import { getDayRange, getSummary } from "./utils";

// What matters now, in four quarters. Quick start needs nothing loaded; the other three share one request.
const Home = () => {
  const now = useCurrentTime(true, DAY_REFRESH_INTERVAL);
  const { data: home, error } = useHomeTasks(getDayRange(now));
  // Lists already on screen stay there when a refresh fails.
  const showLists = !!home || !error;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-4">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-2xl font-semibold">{format(now, "EEEE, d MMMM")}</h1>
        {home && <p className="text-sm text-muted-foreground">{getSummary(home)}</p>}
      </header>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <QuickStart />
        {showLists && (
          <>
            <Today tasks={home?.today} />
            <Resumable tasks={home?.resumable} />
            <Overdue tasks={home?.overdue} />
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
