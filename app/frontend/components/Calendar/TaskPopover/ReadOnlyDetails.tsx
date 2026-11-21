import { cn } from "cn";
import { CalendarDays, Hourglass } from "lucide-react";

import type { Task } from "@/apis/types";
import Breadcrumbs from "@/components/commons/Breadcrumbs";
import LazyRichTextViewer from "@/components/commons/RichText/LazyViewer";
import { formatSchedule } from "@/components/commons/ScheduleLabel/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import useCurrentTime from "@/hooks/useCurrentTime";
import { formatMinutes } from "@/utils";

type ReadOnlyDetailsProps = { task: Task };

const META_CLASS_NAME = "flex h-8 items-center gap-1.5 px-3 text-sm text-muted-foreground [&_svg]:size-4";

// A task laid out like the editable popover, but read only: whether it's done, what was scheduled and estimated, the
// title, the steps as they stand, the breadcrumbs and the description. The schedule is plain text, never red as overdue.
const ReadOnlyDetails = ({ task }: ReadOnlyDetailsProps) => {
  const {
    title,
    description,
    estimatedMinutes,
    isCompleted: isTaskCompleted,
    checklistItems,
    breadcrumbs,
  } = task;
  // Read once: "today" or "tomorrow" only needs to be right for as long as the popover is open.
  const now = useCurrentTime(false);
  const schedule = formatSchedule(task, now);

  return (
    <article className="flex flex-1 flex-col gap-5">
      <div className="flex flex-col gap-1">
        <header className="flex flex-col gap-1.5">
          <div className="flex min-h-8 items-start gap-2">
            <Checkbox
              disabled
              checked={isTaskCompleted}
              aria-label="Completed"
              className="mt-1.5 size-5 disabled:opacity-100"
            />
            <Separator className="mt-2 data-[orientation=vertical]:h-4" orientation="vertical" />
            <div className="flex flex-wrap items-start gap-1">
              {schedule && (
                <span className={META_CLASS_NAME}>
                  <CalendarDays />
                  {schedule}
                </span>
              )}
              {estimatedMinutes !== null && (
                <span className={META_CLASS_NAME}>
                  <Hourglass />
                  {formatMinutes(estimatedMinutes)}
                </span>
              )}
            </div>
          </div>
          <h2 className="py-0.5 text-lg font-semibold wrap-anywhere">{title}</h2>
        </header>
        {checklistItems.length > 0 && (
          <ul aria-label="Steps" className="flex flex-col">
            {checklistItems.map(({ id, title: stepTitle, isCompleted }) => (
              <li key={id} className="flex items-center gap-2 py-1.5 pl-3">
                <Checkbox
                  disabled
                  aria-label={stepTitle}
                  checked={isCompleted}
                  className="border-muted-foreground/50 disabled:opacity-100"
                />
                <span
                  className={cn(
                    "min-w-0 text-sm wrap-anywhere",
                    isCompleted && "text-muted-foreground line-through",
                  )}
                >
                  {stepTitle}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      {description && (
        <section aria-label="Description" className="text-sm">
          <LazyRichTextViewer markdown={description} />
        </section>
      )}
    </article>
  );
};

export default ReadOnlyDetails;
