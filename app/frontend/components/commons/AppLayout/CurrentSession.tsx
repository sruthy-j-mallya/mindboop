import { useLocation } from "react-router";

import Ambience from "@/components/commons/Ambience";
import { useCurrentTimeLog } from "@/hooks/reactQuery/useCurrentTimeLogsApi";
import routes from "@/routes";

import MiniTimer from "./MiniTimer";

// Lives in the layout, so the session's background sound keeps playing across pages. Away from the Timer page, a
// mini timer keeps the clock in view.
const CurrentSession = () => {
  const { pathname } = useLocation();
  const { data: timeLog } = useCurrentTimeLog();

  if (!timeLog) return null;

  return (
    <>
      <Ambience timeLog={timeLog} />
      {pathname !== routes.timer && <MiniTimer timeLog={timeLog} />}
    </>
  );
};

export default CurrentSession;
