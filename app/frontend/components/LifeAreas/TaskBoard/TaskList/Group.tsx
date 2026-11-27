import { useId } from "react";

import TaskRow from "./TaskRow";
import type { TaskGroup } from "./types";

type GroupProps = { group: TaskGroup };

const Group = ({ group: { label, tasks } }: GroupProps) => {
  const headingId = useId();

  return (
    <li className="flex flex-col gap-1">
      <h2 className="px-1 text-xs font-medium tracking-wider text-muted-foreground uppercase" id={headingId}>
        {label}
      </h2>
      <ul aria-labelledby={headingId} className="flex flex-col gap-1">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </ul>
    </li>
  );
};

export default Group;
