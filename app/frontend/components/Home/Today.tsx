import ScheduleLabel from "@/components/commons/ScheduleLabel";
import routes from "@/routes";

import TaskCard from "./TaskCard";
import TaskRow from "./TaskRow";
import type { TaskListProps } from "./types";

const Today = ({ tasks }: TaskListProps) => (
  <TaskCard
    emptyMessage="Nothing is due or scheduled today."
    tasks={tasks}
    title="Today's agenda"
    titlePath={routes.calendar}
    renderTask={(task) => (
      <TaskRow key={task.id} task={task}>
        <ScheduleLabel className="text-xs" schedule={task} />
      </TaskRow>
    )}
  />
);

export default Today;
