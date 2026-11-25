import { Bell, ChevronLeft } from "lucide-react";
import { Link, Navigate, useParams } from "react-router";

import { SOUNDS } from "@/components/commons/Ambience/constants";
import RoutineBadge from "@/components/commons/Routine/Badge";
import { Button } from "@/components/ui/button";
import { useRoutines } from "@/hooks/reactQuery/useRoutinesApi";
import routes from "@/routes";
import { formatMinutes } from "@/utils";

import StartRoutineButton from "../StartRoutineButton";
import { describeReminder, formatLastDone, formatTotalTime } from "../utils";
import ActionsMenu from "./ActionsMenu";
import MonthActivity from "./MonthActivity";
import StatTile from "./StatTile";

// How a routine is going: only what was done, never what wasn't.
const RoutinePane = () => {
  const { routineId } = useParams();
  const { data: routines, isPending } = useRoutines();
  const routine = routines?.find(({ id }) => id === routineId);

  if (isPending) return null;

  // Deleted, or never there.
  if (!routine) return <Navigate replace to={routes.routines.index} />;

  const { title, color, emoji, durationMinutes, sound, sessionsCount, totalSeconds, lastDoneAt } = routine;
  const soundLabel = SOUNDS.find(({ id }) => id === sound)?.label;
  const reminder = describeReminder(routine);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
      <Button asChild className="w-fit lg:hidden" size="sm" variant="ghost">
        <Link to={routes.routines.index}>
          <ChevronLeft />
          All routines
        </Link>
      </Button>
      <header className="flex items-start gap-3">
        <RoutineBadge className="size-12 text-2xl" color={color} emoji={emoji} />
        <div className="grid min-w-0 flex-1 gap-0.5">
          <h2 className="text-2xl font-semibold wrap-anywhere">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {formatMinutes(durationMinutes)}
            {sound !== "none" && soundLabel && ` · ${soundLabel}`}
          </p>
          {reminder && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Bell className="size-3.5" />
              {reminder}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <StartRoutineButton hasLabel routine={routine} />
          <ActionsMenu routine={routine} />
        </div>
      </header>
      <p className="text-sm text-muted-foreground">
        {sessionsCount === 0
          ? "Not started yet. Whenever you’re ready, it’s one click away."
          : "Every time counts. Days you skip don’t undo any of it."}
      </p>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="Times done" value={String(sessionsCount)} />
        <StatTile label="Time given" value={formatTotalTime(totalSeconds)} />
        <StatTile label="Last time" value={lastDoneAt ? formatLastDone(lastDoneAt, new Date()) : "Not yet"} />
      </dl>
      <MonthActivity key={routine.id} routine={routine} />
    </div>
  );
};

export default RoutinePane;
