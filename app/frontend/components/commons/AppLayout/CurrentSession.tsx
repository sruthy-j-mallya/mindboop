import { useLocation } from "react-router";

import { useCurrentTimeLog } from "@/hooks/reactQuery/useCurrentTimeLogsApi";
import routes from "@/routes";

import MiniTimer from "./MiniTimer";
import SessionSound from "./SessionSound";

// Lives in the layout, so the session's background sound keeps playing across pages. Away from the Timer page, a
// mini timer keeps the clock in view.
const CurrentSession = () => {
  const { pathname } = useLocation();
  const { data: timeLog } = useCurrentTimeLog();

  if (!timeLog) return null;

  return (
    <>
      <SessionSound timeLog={timeLog} />
      {pathname !== routes.timer && <MiniTimer timeLog={timeLog} />}
    </>
  );
};

export default CurrentSession;
