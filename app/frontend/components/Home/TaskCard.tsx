import { useId, useState } from "react";

import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { SHOWN_TASKS_COUNT } from "./constants";
import type { TaskCardProps } from "./types";

// One of Home's lists. A long one is cut short until "Show all" expands the card in place.
const TaskCard = ({ title, titlePath, tasks, emptyMessage, renderTask }: TaskCardProps) => {
  const headingId = useId();
  const [showAll, setShowAll] = useState(false);
  const shownTasks = showAll ? tasks : tasks?.slice(0, SHOWN_TASKS_COUNT);
  const hasMore = !showAll && !!tasks && tasks.length > SHOWN_TASKS_COUNT;

  const handleShowAll = () => setShowAll(true);

  return (
    <section aria-busy={!tasks} aria-labelledby={headingId} className="grid min-w-0">
      <Card>
        <CardContent className="flex flex-col gap-3">
          <h2 id={headingId} className="font-semibold">
            {titlePath ? (
              <Link className="underline-offset-4 hover:underline" to={titlePath}>
                {title}
              </Link>
            ) : (
              title
            )}
          </h2>
          {tasks?.length === 0 && <p className="text-sm text-muted-foreground">{emptyMessage}</p>}
          {!!shownTasks?.length && (
            <ul aria-labelledby={headingId} className="flex flex-col divide-y">
              {shownTasks.map(renderTask)}
            </ul>
          )}
          {hasMore && (
            <Button className="self-start" size="sm" type="button" variant="ghost" onClick={handleShowAll}>
              Show all {tasks.length}
            </Button>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default TaskCard;
