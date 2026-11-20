import { useState } from "react";

import { cn } from "cn";
import { Outlet } from "react-router";

import type { LifeArea } from "@/apis/types";
import { Card, CardContent } from "@/components/ui/card";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import useOpenTask from "@/hooks/useOpenTask";

import AddTaskForm from "./AddTaskForm";
import BoardHeading from "./BoardHeading";
import { SEARCH_DEBOUNCE_DELAY } from "./constants";
import SearchField from "./SearchField";
import TaskList from "./TaskList";

type BoardProps = { lifeArea?: LifeArea };

// The list sits on the left and the picked task (the nested route) on the right. On narrow screens only one shows at
// a time: the list, or the task once one is picked. On wide screens the page fits the screen (basis-0 keeps its content
// from stretching it), the list and the pane scroll on their own, and the pane's description fills the pane.
const Board = ({ lifeArea }: BoardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncedValue(searchTerm.trim(), SEARCH_DEBOUNCE_DELAY);
  const isTaskSelected = !!useOpenTask().openTaskId;

  return (
    <div className="mx-auto grid w-full max-w-6xl min-w-0 flex-1 grid-rows-[1fr] gap-6 p-4 pt-0 max-lg:pt-4 lg:basis-0 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden">
      <section
        aria-labelledby="task-board-heading"
        className={cn("flex flex-col gap-4 lg:min-h-0", isTaskSelected && "max-lg:hidden")}
      >
        <BoardHeading id="task-board-heading" lifeArea={lifeArea} />
        <AddTaskForm lifeArea={lifeArea} />
        <SearchField value={searchTerm} onChange={setSearchTerm} />
        <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          <TaskList lifeArea={lifeArea} searchTerm={debouncedSearchTerm} />
        </div>
      </section>
      <Card className={cn("lg:overflow-y-auto", !isTaskSelected && "max-lg:hidden")}>
        <CardContent className="flex flex-1 flex-col">
          <Outlet />
        </CardContent>
      </Card>
    </div>
  );
};

export default Board;
