import { Link2 } from "lucide-react";

import type { Task } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { SEARCH_DEBOUNCE_DELAY } from "@/constants";
import { useTasks } from "@/hooks/reactQuery/useTasksApi";
import useDebouncedValue from "@/hooks/useDebouncedValue";

import { TASK_SUGGESTION_LIMIT } from "./constants";

type TaskSuggestionsProps = { searchTerm: string; onSelect: (task: Task) => void };

// Existing tasks whose title matches what's typed, so the time can go to one of them instead. Searched once typing
// pauses, not on every key.
const TaskSuggestions = ({ searchTerm, onSelect }: TaskSuggestionsProps) => {
  const trimmedSearchTerm = searchTerm.trim();
  const debouncedSearchTerm = useDebouncedValue(trimmedSearchTerm, SEARCH_DEBOUNCE_DELAY);
  const { data: { tasks = [] } = {} } = useTasks(
    { searchTerm: debouncedSearchTerm },
    { enabled: !!debouncedSearchTerm },
  );
  // A cleared field hides them at once, without waiting for the debounce.
  const suggestions = trimmedSearchTerm && debouncedSearchTerm ? tasks.slice(0, TASK_SUGGESTION_LIMIT) : [];

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
