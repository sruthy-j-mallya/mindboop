import SwitchSessionDialog from "@/components/commons/SwitchSessionDialog";
import useStartTask from "@/hooks/useStartTask";

import ResumableRow from "./ResumableRow";
import TaskCard from "./TaskCard";
import type { TaskListProps } from "./types";

// Tasks bailed out of. The switch dialog lives here and not in a row, which can drop out of the list as the session on
// the clock ends.
const Resumable = ({ tasks }: TaskListProps) => {
  const { startTask, isLoadingSession, runningTaskId, switchDialogProps } = useStartTask();

  return (
    <>
      <TaskCard
        emptyMessage="When you bail out of a session, the note you leave yourself shows up here."
        tasks={tasks}
        title="Pick up where you left off"
        renderTask={(task) => (
          <ResumableRow
            key={task.id}
            isDisabled={isLoadingSession}
            isOnTheClock={runningTaskId === task.id}
            task={task}
            onStart={startTask}
          />
        )}
      />
      {switchDialogProps && <SwitchSessionDialog {...switchDialogProps} />}
    </>
  );
};

export default Resumable;
