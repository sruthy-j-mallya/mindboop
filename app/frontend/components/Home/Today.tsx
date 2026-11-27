import SwitchSessionDialog from "@/components/commons/SwitchSessionDialog";
import { useLifeAreas } from "@/hooks/reactQuery/useLifeAreasApi";
import useStartTask from "@/hooks/useStartTask";
import routes from "@/routes";

import AgendaRow from "./AgendaRow";
import TaskCard from "./TaskCard";
import type { TaskListProps } from "./types";

// The switch dialog lives here and not in a row, which can drop out of the list as the session on the clock ends.
const Today = ({ tasks }: TaskListProps) => {
  const { data: lifeAreas = [] } = useLifeAreas();
  const { startTask, isLoadingSession, runningTaskId, switchDialogProps } = useStartTask();

  return (
    <>
      <TaskCard
        emptyMessage="Nothing is due or scheduled today."
        tasks={tasks}
        title="Today's agenda"
        titlePath={routes.calendar}
        renderTask={(task) => (
          <AgendaRow
            key={task.id}
            isDisabled={isLoadingSession}
            isOnTheClock={runningTaskId === task.id}
            lifeArea={lifeAreas.find(({ id }) => id === task.lifeAreaId)}
            task={task}
            onStart={startTask}
          />
        )}
      />
      {switchDialogProps && <SwitchSessionDialog {...switchDialogProps} />}
    </>
  );
};

export default Today;
