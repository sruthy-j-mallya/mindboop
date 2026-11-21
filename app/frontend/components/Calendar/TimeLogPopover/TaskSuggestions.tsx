import { useDeferredValue } from "react";

import { Link2 } from "lucide-react";

import type { Task } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/reactQuery/useTasksApi";

import { TASK_SUGGESTION_LIMIT } from "./constants";

type TaskSuggestionsProps = { searchTerm: string; onSelect: (task: Task) => void };

// Existing tasks whose title matches what's typed, so the time can go to one of them instead.
const TaskSuggestions = ({ searchTerm, onSelect }: TaskSuggestionsProps) => {
  const deferredSearchTerm = useDeferredValue(searchTerm.trim());
  const { data: { tasks = [] } = {} } = useTasks(
    { searchTerm: deferredSearchTerm },
    { enabled: !!deferredSearchTerm },
  );
  const suggestions = deferredSearchTerm ? tasks.slice(0, TASK_SUGGESTION_LIMIT) : [];

  if (suggestions.length === 0) return null;

  return (
    <section aria-label="Matching tasks" className="flex min-h-0 flex-col gap-1">
      <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
        Or link an existing task
      </p>
      <ul className="flex min-h-0 flex-col overflow-y-auto">
        {suggestions.map((task) => (
          <li key={task.id}>
            <Button
              aria-label={`Link to ${task.title}`}
              className="w-full justify-start font-normal"
              size="sm"
              type="button"
              variant="ghost"
              onClick={() => onSelect(task)}
            >
              <Link2 className="text-muted-foreground" />
              <span className="truncate">{task.title}</span>
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TaskSuggestions;
