import { cn } from "cn";
import { parseISO } from "date-fns";
import { Inbox, RotateCcw } from "lucide-react";

import LifeAreaBadge from "@/components/commons/LifeArea/Badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/dateTime";

import { INBOX_NAME } from "../constants";
import type { ArchiveRowProps } from "./types";

// A task that's out of its list: what it was, where it was, and a way back.
const ArchiveRow = ({ task, lifeArea, actionLabel, isBusy, onAction }: ArchiveRowProps) => {
  const { title, isCompleted, discardedAt } = task;
  const listName = lifeArea?.name ?? INBOX_NAME;

  const handleAction = () => onAction(task, listName);

  return (
    <li className={cn("flex items-center gap-3 py-2", isBusy && "opacity-50")}>
      <div className="grid min-w-0 flex-1 gap-1">
        <p className={cn("text-sm wrap-anywhere", isCompleted && "text-muted-foreground line-through")}>
          {title}
        </p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            {lifeArea ? (
              <LifeAreaBadge
                className="size-4 rounded text-[0.625rem]"
                color={lifeArea.color}
                emoji={lifeArea.emoji}
              />
            ) : (
              <Inbox aria-hidden className="size-3.5" />
            )}
            {listName}
          </span>
          {discardedAt && (
            <time dateTime={discardedAt}>Deleted {formatDate(parseISO(discardedAt), new Date())}</time>
          )}
        </p>
      </div>
      <Button
        aria-label={`${actionLabel} ${title}`}
        disabled={isBusy}
        size="sm"
        type="button"
        variant="ghost"
        onClick={handleAction}
      >
        <RotateCcw />
        {actionLabel}
      </Button>
    </li>
  );
};

export default ArchiveRow;
