import { useLocation } from "react-router";

import { useCurrentTimeLog } from "@/hooks/reactQuery/useCurrentTimeLogsApi";
import useCurrentTime from "@/hooks/useCurrentTime";
import useDocumentTitle from "@/hooks/useDocumentTitle";

import { getPageTitle } from "./utils";

// Keeps the browser's tab up to date. A component of its own, so a session's ticking re-renders nothing else.
const PageTitle = () => {
  const { pathname } = useLocation();
  const { data: timeLog } = useCurrentTimeLog();
  const currentTime = useCurrentTime(!!timeLog?.isRunning);
  useDocumentTitle(getPageTitle(pathname, timeLog, currentTime));

  return null;
};

export default PageTitle;
