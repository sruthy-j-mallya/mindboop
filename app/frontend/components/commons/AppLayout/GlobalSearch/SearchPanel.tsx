import { type ChangeEvent, type KeyboardEvent, useEffect, useId, useRef, useState } from "react";

import { keepPreviousData } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useNavigate } from "react-router";

import type { Task } from "@/apis/types";
import { SEARCH_DEBOUNCE_DELAY } from "@/constants";
import { useLifeAreas } from "@/hooks/reactQuery/useLifeAreasApi";
import { useTasks } from "@/hooks/reactQuery/useTasksApi";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { getTaskPath } from "@/utils";

import { SEARCH_FILTERS } from "./constants";
import Result from "./Result";

type SearchPanelProps = { onClose: () => void };

// Finds open tasks in any list, from any page, and opens the one picked. An ARIA combobox: typing lists the matches (a
// page of them, soonest due first), arrows move the highlight, Enter opens. Escape is left
// to the dialog, which closes.
const SearchPanel = ({ onClose }: SearchPanelProps) => {
  const navigate = useNavigate();
  const listboxId = useId();
  const listboxRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const trimmedQuery = query.trim();
  const searchTerm = useDebouncedValue(trimmedQuery, SEARCH_DEBOUNCE_DELAY);
  const isOpen = !!trimmedQuery;
  // The previous matches stay listed while the next search loads, so the list doesn't flash empty between keys.
  const { data, isPlaceholderData, error } = useTasks(
    { ...SEARCH_FILTERS, searchTerm },
    { enabled: !!searchTerm && isOpen, placeholderData: keepPreviousData },
  );
  const { data: lifeAreas = [] } = useLifeAreas({ enabled: isOpen });
  // Enter waits for the matches of what's typed, so it can't open one from the previous search's list.
  const isSettled = !!data && !isPlaceholderData && searchTerm === trimmedQuery;
  const tasks = (searchTerm && data?.tasks) || [];
  const hasMore = (data?.totalPages ?? 0) > 1;
  const activeTask = isOpen ? tasks[Math.min(activeIndex, tasks.length - 1)] : undefined;
  const optionId = (task: Task) => `${listboxId}-${task.id}`;

  useEffect(() => {
    listboxRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [activeTask]);

  const handlePick = (task: Task) => {
    onClose();
    navigate(getTaskPath(task.id, task.lifeAreaId));
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setActiveIndex(0);
  };

  const moveHighlight = (step: number) =>
    setActiveIndex(Math.min(Math.max(activeIndex + step, 0), Math.max(tasks.length - 1, 0)));

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const { key } = event;
    // An input method's own Enter and arrows pick what's being composed.
    if (!isOpen || event.nativeEvent.isComposing) return;

    if (key === "Enter") {
      event.preventDefault();
      if (activeTask && isSettled) handlePick(activeTask);
    } else if (key === "ArrowDown" || key === "ArrowUp") {
      event.preventDefault();
      moveHighlight(key === "ArrowDown" ? 1 : -1);
    }
  };

  const getStatus = () => {
    if (tasks.length > 0) return null;

    return isSettled ? `No open tasks match “${searchTerm}”` : "Searching…";
  };

  const status = getStatus();

  return (
    // Shrinks to the dialog, whose grid would otherwise stretch to the longest match.
    <div className="min-w-0" role="search">
      <div className="flex items-center gap-3 px-4">
        <Search aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <input
          aria-activedescendant={activeTask ? optionId(activeTask) : undefined}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={isOpen}
          aria-label="Search tasks"
          autoComplete="off"
          className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          placeholder="Search titles, descriptions and steps"
          role="combobox"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>
      {isOpen && (
        <div className="border-t">
          {error && (
            <p className="px-4 py-2 text-sm text-destructive" role="alert">
              {error.message}
            </p>
          )}
          {!error && status && (
            <p className="px-4 py-2 text-sm text-muted-foreground" role="status">
              {status}
            </p>
          )}
          <ul
            ref={listboxRef}
            aria-label="Matching tasks"
            className="max-h-[50svh] overflow-y-auto"
            id={listboxId}
            role="listbox"
          >
            {tasks.map((task, index) => (
              <Result
                key={task.id}
                id={optionId(task)}
                isActive={task.id === activeTask?.id}
                lifeArea={lifeAreas.find(({ id }) => id === task.lifeAreaId)}
                searchTerm={searchTerm}
                task={task}
                onHighlight={() => setActiveIndex(index)}
                onPick={handlePick}
              />
            ))}
          </ul>
          {tasks.length > 0 && hasMore && (
            <p className="border-t px-4 py-2 text-xs text-muted-foreground">
              Showing the first {tasks.length}. Keep typing to narrow it down.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPanel;
