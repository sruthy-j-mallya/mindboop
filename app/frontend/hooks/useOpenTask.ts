import { useMatch } from "react-router";

import routes from "@/routes";
import { getTaskListPath } from "@/utils";

// The task open beside a task list (the Inbox's or an area's), if any, and the path of that list, to go back to once
// the task leaves it.
const useOpenTask = () => {
  const inboxMatch = useMatch(routes.inbox.show);
  const lifeAreaMatch = useMatch(routes.lifeAreas.task);

  return {
    openTaskId: (inboxMatch ?? lifeAreaMatch)?.params.taskId,
    listPath: getTaskListPath(lifeAreaMatch?.params.lifeAreaId),
  };
};

export default useOpenTask;
