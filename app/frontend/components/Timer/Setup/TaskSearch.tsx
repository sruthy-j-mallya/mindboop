import { type ChangeEvent, type KeyboardEvent, useEffect, useId, useRef, useState } from "react";

import { keepPreviousData } from "@tanstack/react-query";
import { cn } from "cn";
import { Check, Search } from "lucide-react";

import type { Task } from "@/apis/types";
import TextLink from "@/components/commons/TextLink";
import { Input } from "@/components/ui/input";
import { useTasks } from "@/hooks/reactQuery/useTasksApi";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import routes from "@/routes";

import { OPEN_TASK_FILTERS, TASK_SEARCH_DEBOUNCE } from "./constants";

type TaskSearchProps = { value?: Task; onChange: (task: Task) => void };

// Picks an open Inbox task to focus on, searched by title on the server (a page of matches, soonest due first). An
// ARIA combobox: focusing it opens the list, typing narrows it, arrows move the highlight, Enter picks, Escape closes.
const TaskSearch = ({ value, onChange }: TaskSearchProps) => {
  const listboxId = useId();
  const listboxRef = useRef<HTMLUListElement>(null);
  // null while closed, when the field shows the picked task's title.
  const [query, setQuery] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isOpen = query !== null;
  const searchTerm = useDebouncedValue(query?.trim() ?? "", TASK_SEARCH_DEBOUNCE);
  // The previous matches stay listed while the next search loads, so the list doesn't flash empty between keys.
  const { data, isPending, isPlaceholderData, error } = useTasks(
    { ...OPEN_TASK_FILTERS, searchTerm: searchTerm || undefined },
    { placeholderData: keepPreviousData },
  );
  const tasks = data?.tasks ?? [];
  // Enter waits for the matches of what's typed, so it can't pick from the previous search's list.
  const isSettled = !isPlaceholderData && searchTerm === (query?.trim() ?? "");
  const hasMore = (data?.totalPages ?? 0) > 1;
  const hasNoOpenTasks = !searchTerm && !isPending && !error && tasks.length === 0;
  const activeTask = tasks.length > 0 ? tasks[Math.min(activeIndex, tasks.length - 1)] : undefined;
  const optionId = (task: Task) => `${listboxId}-${task.id}`;

  useEffect(() => {
    listboxRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [activeTask]);

  const open = () => {
    setQuery("");
    setActiveIndex(0);
  };

  const close = () => setQuery(null);

  const pick = (task: Task) => {
    onChange(task);
    close();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setActiveIndex(0);
  };

  const handleClick = () => {
    if (!isOpen) open();
  };

  const moveHighlight = (step: number) =>
    setActiveIndex(Math.min(Math.max(activeIndex + step, 0), Math.max(tasks.length - 1, 0)));

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const { key } = event;
    if (key === "Escape" && isOpen) {
      event.preventDefault();
      close();
    } else if (key === "Enter" && isOpen && activeTask && isSettled) {
      event.preventDefault();
      pick(activeTask);
    } else if (key === "ArrowDown" || key === "ArrowUp") {
      event.preventDefault();
      if (isOpen) moveHighlight(key === "ArrowDown" ? 1 : -1);
      else open();
    }
  };

  const getStatus = () => {
    if (isPending) return "Loading tasks…";
    if (tasks.length > 0) return null;

    return searchTerm ? `No open tasks match “${searchTerm}”` : "No open tasks";
  };

  const status = getStatus();

  return (
    <div className="grid gap-2">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          aria-activedescendant={isOpen && activeTask ? optionId(activeTask) : undefined}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={isOpen}
          aria-label="Task"
          autoComplete="off"
          className="h-auto py-2 pl-9 text-base font-medium md:text-base"
          placeholder={value?.title ?? "Search your open tasks"}
          role="combobox"
          value={query ?? value?.title ?? ""}
          onBlur={close}
          onChange={handleChange}
          onClick={handleClick}
          onFocus={open}
          onKeyDown={handleKeyDown}
        />
        {isOpen && (
          <div className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
            {error && (
              <p className="px-3 py-2 text-sm text-destructive" role="alert">
                {error.message}
              </p>
            )}
            {!error && status && <p className="px-3 py-2 text-sm text-muted-foreground">{status}</p>}
            <ul
              ref={listboxRef}
              aria-label="Tasks"
              className="max-h-72 overflow-y-auto"
              id={listboxId}
              role="listbox"
            >
              {tasks.map((task, index) => (
                <li
                  key={task.id}
                  aria-selected={task.id === activeTask?.id}
                  id={optionId(task)}
                  role="option"
                  className={cn(
                    "flex cursor-default items-center gap-2 px-3 py-2 text-sm",
                    task.id === activeTask?.id && "bg-accent text-accent-foreground",
                  )}
                  // Keeps focus in the field, so the blur doesn't close the list before the click lands.
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => pick(task)}
                  onMouseMove={() => setActiveIndex(index)}
                >
                  <span className="min-w-0 flex-1 truncate">{task.title}</span>
                  {task.id === value?.id && <Check aria-hidden="true" className="size-4 text-primary" />}
                </li>
              ))}
            </ul>
            {hasMore && (
              <p className="border-t px-3 py-2 text-xs text-muted-foreground">
                Showing the first {tasks.length}. Keep typing to narrow it down.
              </p>
            )}
          </div>
        )}
      </div>
      {hasNoOpenTasks && (
        <p className="text-sm text-muted-foreground">
          Add one in the <TextLink to={routes.inbox.index}>Inbox</TextLink> first.
        </p>
      )}
    </div>
  );
};

export default TaskSearch;
