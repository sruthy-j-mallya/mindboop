import { cn } from "cn";
import { Outlet, useMatch } from "react-router";

import routes from "@/routes";

import RoutineList from "./RoutineList";

// The routines beside the one picked, as a list and a pane. On narrow screens, one at a time: the list until a routine
// is picked, then its pane with a way back.
const Routines = () => {
  const isRoutineOpen = !!useMatch(routes.routines.show);

  return (
    <div className="flex flex-1 flex-col lg:basis-0 lg:flex-row lg:overflow-hidden">
      <RoutineList
        className={cn(
          "lg:w-96 lg:shrink-0 lg:overflow-y-auto lg:border-r",
          isRoutineOpen && "hidden lg:flex",
        )}
      />
      <div className={cn("flex-1 lg:overflow-y-auto", !isRoutineOpen && "hidden lg:block")}>
        <Outlet />
      </div>
    </div>
  );
};

export default Routines;
