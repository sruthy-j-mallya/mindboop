import { useState } from "react";

import {
  horizontalListSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "cn";
import { CircleCheck, Plus, Trash2 } from "lucide-react";

import type { LifeArea } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { useLifeAreas } from "@/hooks/reactQuery/useLifeAreasApi";
import { useTaskCounts } from "@/hooks/reactQuery/useTaskCountsApi";
import useMediaQuery from "@/hooks/useMediaQuery";
import routes from "@/routes";

import NewAreaDialog from "../AreaDialog/New";
import { NARROW_LAYOUT_QUERY } from "../constants";
import { COMPLETED_NAME, DELETED_NAME } from "../TaskArchive/constants";
import { getTasksCount } from "../utils";
import ArchiveItem from "./ArchiveItem";
import AreaItem from "./AreaItem";
import InboxItem from "./InboxItem";
import SuggestionPicker from "./SuggestionPicker";

// `lifeAreas` comes from the drag context, so a dropped area shows in its new place at once.
type AreaNavProps = { lifeAreas: LifeArea[]; className?: string };

// The Inbox, the completed and deleted tasks, then the areas in the user's order (changed by dragging), to switch between and drop tasks on (and to edit
// or delete, from an area's right-click menu). A column on wide screens; on narrow ones the areas are a row that scrolls sideways. Until there are
// areas, suggestions to pick from take their place.
const AreaNav = ({ lifeAreas, className }: AreaNavProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const { isPending, error } = useLifeAreas();
  const { data: taskCounts = [] } = useTaskCounts();
  const isNarrow = useMediaQuery(NARROW_LAYOUT_QUERY);
  const isEmpty = !isPending && !error && lifeAreas.length === 0;

  const handleAdd = () => setIsAdding(true);
  const handleCloseAdd = () => setIsAdding(false);

  return (
    <nav
      aria-label="Areas of life"
      className={cn(
        "flex shrink-0 flex-col gap-3 border-b px-4 pb-4 lg:w-60 lg:overflow-y-auto lg:border-r lg:border-b-0",
        className,
      )}
    >
      <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 py-0.5 lg:flex-col lg:overflow-visible">
        <InboxItem tasksCount={getTasksCount(taskCounts, null)} />
        <ArchiveItem icon={CircleCheck} name={COMPLETED_NAME} to={routes.completedTasks} />
        <ArchiveItem icon={Trash2} name={DELETED_NAME} to={routes.deletedTasks} />
      </ul>
      <div className="flex min-h-8 items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">Areas of life</h2>
        {!isEmpty && (
          <Button aria-label="Add an area" size="icon-sm" type="button" variant="ghost" onClick={handleAdd}>
            <Plus />
          </Button>
        )}
      </div>
      {lifeAreas.length > 0 && (
        <SortableContext
          items={lifeAreas}
          strategy={isNarrow ? horizontalListSortingStrategy : verticalListSortingStrategy}
        >
          <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 py-0.5 lg:flex-col lg:overflow-visible">
            {lifeAreas.map((lifeArea) => (
              <AreaItem
                key={lifeArea.id}
                lifeArea={lifeArea}
                tasksCount={getTasksCount(taskCounts, lifeArea.id)}
              />
            ))}
          </ul>
        </SortableContext>
      )}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
      {isEmpty && (
        <div className="flex flex-col gap-3 rounded-lg border border-dashed p-3">
          <p className="text-sm text-muted-foreground">
            Group your tasks by the parts of your life. Pick a few to start with, or add your own.
          </p>
          <SuggestionPicker>
            <Button size="sm" type="button" variant="outline" onClick={handleAdd}>
              <Plus />
              Add your own
            </Button>
          </SuggestionPicker>
        </div>
      )}
      {isAdding && <NewAreaDialog onClose={handleCloseAdd} />}
    </nav>
  );
};

export default AreaNav;
