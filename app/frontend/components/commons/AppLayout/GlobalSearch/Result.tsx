import { cn } from "cn";
import type { MouseEvent } from "react";

import { INBOX_LABEL } from "@/components/commons/LifeAreaPicker/constants";

import type { ResultProps } from "./types";
import { getMatchedDetail } from "./utils";

// A task that was found, the list it's in, and what matched if that isn't its title.
const Result = ({ id, task, lifeArea, searchTerm, isActive, onHighlight, onPick }: ResultProps) => {
  const matchedDetail = getMatchedDetail(task, searchTerm);

  // Keeps focus in the field, so the blur doesn't close the list before the click lands.
  const handleMouseDown = (event: MouseEvent) => event.preventDefault();

  const handleClick = () => onPick(task);

  return (
    <li
      aria-selected={isActive}
      className={cn("cursor-default px-4 py-2.5 text-sm", isActive && "bg-accent text-accent-foreground")}
      id={id}
      role="option"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={onHighlight}
    >
      <span className="flex items-center gap-3">
        <span className="min-w-0 flex-1 truncate">{task.title}</span>
        <span className="sr-only">, in </span>
        <span className="max-w-1/3 shrink-0 truncate text-xs text-muted-foreground">
          {lifeArea ? `${lifeArea.emoji} ${lifeArea.name}` : INBOX_LABEL}
        </span>
      </span>
      {matchedDetail && <span className="block truncate text-xs text-muted-foreground">{matchedDetail}</span>}
    </li>
  );
};

export default Result;
