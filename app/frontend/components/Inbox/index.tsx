import { cn } from "cn";
import { Outlet, useMatch } from "react-router";

import { Card, CardContent } from "@/components/ui/card";
import routes from "@/routes";

import AddTaskForm from "./AddTaskForm";
import TaskList from "./TaskList";

// The list sits on the left and the picked task (the nested route) on the right. On narrow screens only one shows at
// a time: the list, or the task once one is picked.
const Inbox = () => {
  const isTaskSelected = !!useMatch(routes.inbox.show);

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 p-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
      <section
        aria-labelledby="inbox-heading"
        className={cn("flex flex-col gap-4", isTaskSelected && "max-lg:hidden")}
      >
        <h1 className="text-2xl font-semibold" id="inbox-heading">
          Inbox
        </h1>
        <AddTaskForm />
        <TaskList />
      </section>
      <Card className={cn("lg:sticky lg:top-4", !isTaskSelected && "max-lg:hidden")}>
        <CardContent>
          <Outlet />
        </CardContent>
      </Card>
    </div>
  );
};

export default Inbox;
