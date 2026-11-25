import { Play, Timer } from "lucide-react";

import { formatBreadcrumbTime } from "@/components/commons/Breadcrumbs/utils";
import { Button } from "@/components/ui/button";
import useDatePreferences from "@/hooks/useDatePreferences";

import TaskRow from "./TaskRow";
import type { ResumableRowProps } from "./types";

const ResumableRow = ({ task, isOnTheClock, isDisabled, onResume }: ResumableRowProps) => {
  const { timeFormat } = useDatePreferences();
  // Newest first, so the first is the latest one left.
  const breadcrumb = task.breadcrumbs.at(0);
  const label = isOnTheClock ? "On the clock" : "Resume";

  const handleResume = () => onResume(task.id);

  return (
    <TaskRow
      task={task}
      details={
        breadcrumb && (
          <>
            <p className="text-sm wrap-anywhere whitespace-pre-line text-muted-foreground">
              Pick up from: {breadcrumb.restartDescription}
            </p>
            <time
              className="rounded-lg bg-brand-yellow px-2 py-0.5 text-xs font-semibold text-brand-purple-dark"
              dateTime={breadcrumb.createdAt}
            >
              {formatBreadcrumbTime(breadcrumb.createdAt, timeFormat)}
            </time>
          </>
        )
      }
    >
      <Button
        aria-label={`${label}: ${task.title}`}
        disabled={isDisabled}
        size="sm"
        type="button"
        variant="secondary"
        onClick={handleResume}
      >
        {isOnTheClock ? <Timer /> : <Play />}
        {label}
      </Button>
    </TaskRow>
  );
};

export default ResumableRow;
