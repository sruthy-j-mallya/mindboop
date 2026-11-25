type DeleteState = { isChecking: boolean; hasTasks: boolean; hasChoice: boolean };

// What the delete dialog says about the area's uncompleted tasks.
export const getDeleteDescription = ({ isChecking, hasTasks, hasChoice }: DeleteState) => {
  if (isChecking) return "Checking for tasks…";

  if (!hasTasks) return "It has no uncompleted tasks.";

  return hasChoice
    ? "Pick a list to move its uncompleted tasks to."
    : "Its uncompleted tasks move to the Inbox.";
};
