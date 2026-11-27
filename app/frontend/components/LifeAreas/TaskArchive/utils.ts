import type { Task } from "@/apis/types";

import { INBOX_NAME } from "../constants";
import { COMPLETED_NAME } from "./constants";

// "Restored “Pay rent” to Home". The list comes from the server's answer: a task whose area is gone goes to the Inbox,
// and one that was completed when it was deleted is still completed.
export const describeReturn = (verb: string, { title, isCompleted, lifeAreaId }: Task, listName: string) => {
  if (isCompleted) return `${verb} “${title}” to ${COMPLETED_NAME}`;

  const destination = lifeAreaId ? listName : `your ${INBOX_NAME}`;

  return `${verb} “${title}” to ${destination}`;
};
