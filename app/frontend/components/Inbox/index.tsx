import { cn } from "cn";
import { Outlet, useMatch } from "react-router";

import { Card, CardContent } from "@/components/ui/card";
import routes from "@/routes";

import AddTaskForm from "./AddTaskForm";
import TaskList from "./TaskList";

// The list sits on the left and the picked task (the nested route) on the right. On narrow screens only one shows at
// a time: the list, or the task once one is picked. On wide screens the page fits the screen (basis-0 keeps its content
// from stretching it), the list and the pane scroll on their own, and the pane's description fills the pane.
const Inbox = () => {
  const isTaskSelected = !!useMatch(routes.inbox.show);

  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 grid-rows-[1fr] gap-6 p-4 lg:basis-0 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden">
      <section
        aria-labelledby="inbox-heading"
        className={cn("flex flex-col gap-4 lg:min-h-0", isTaskSelected && "max-lg:hidden")}
      >
        <h1 className="text-2xl font-semibold" id="inbox-heading">
          Inbox
        </h1>
        <AddTaskForm />
        <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          <TaskList />
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

export default Inbox;
