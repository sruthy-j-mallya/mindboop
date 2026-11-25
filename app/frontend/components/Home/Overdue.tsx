import OverdueRow from "./OverdueRow";
import TaskCard from "./TaskCard";
import type { TaskListProps } from "./types";

const Overdue = ({ tasks }: TaskListProps) => (
  <TaskCard
    emptyMessage="Nothing overdue."
    tasks={tasks}
    title="Overdue"
    renderTask={(task) => <OverdueRow key={task.id} task={task} />}
  />
);

export default Overdue;
