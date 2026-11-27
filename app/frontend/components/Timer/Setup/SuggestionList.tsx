import { useId } from "react";

import type { Task } from "@/apis/types";
import { Button } from "@/components/ui/button";

import { SUGGESTIONS_COUNT } from "./constants";

type SuggestionListProps = { title: string; tasks: Task[]; onPick: (task: Task) => void };

const SuggestionList = ({ title, tasks, onPick }: SuggestionListProps) => {
  const headingId = useId();

  if (tasks.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="grid gap-1">
      <h2 className="text-xs font-medium tracking-wider text-muted-foreground uppercase" id={headingId}>
        {title}
      </h2>
      <ul className="-mx-3 grid">
        {tasks.slice(0, SUGGESTIONS_COUNT).map((task) => (
          <li key={task.id}>
            <Button
              className="h-auto w-full justify-start py-2 text-left font-normal whitespace-normal"
              type="button"
              variant="ghost"
              onClick={() => onPick(task)}
            >
              <span className="min-w-0 wrap-anywhere">{task.title}</span>
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SuggestionList;
