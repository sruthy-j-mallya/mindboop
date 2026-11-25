import { useState } from "react";

import { cn } from "cn";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRoutines } from "@/hooks/reactQuery/useRoutinesApi";

import NewRoutineDialog from "../RoutineDialog/New";
import RoutineRow from "./RoutineRow";
import Suggestions from "./Suggestions";

type RoutineListProps = { className?: string };

// Every routine, oldest first, with the ideas to start with until there's one.
const RoutineList = ({ className }: RoutineListProps) => {
  const { data: routines = [], isPending, error } = useRoutines();
  const [showNewDialog, setShowNewDialog] = useState(false);
  // Read once per render, so "Today" and "Yesterday" agree across rows.
  const now = new Date();

  const handleAdd = () => setShowNewDialog(true);
  const handleNewDialogClose = () => setShowNewDialog(false);

  return (
    <section aria-labelledby="routines-heading" className={cn("flex flex-col gap-4 p-4", className)}>
      <header className="flex items-center justify-between gap-2 px-2">
        <h1 className="text-2xl font-semibold" id="routines-heading">
          Routines
        </h1>
        <Button
          aria-label="New routine"
          size="icon-sm"
          title="New routine"
          type="button"
          variant="ghost"
          onClick={handleAdd}
        >
          <Plus />
        </Button>
      </header>
      {error && (
        <p className="px-2 text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
      {!isPending && routines.length > 0 && (
        <ul aria-label="Routines" className="grid gap-0.5">
          {routines.map((routine) => (
            <RoutineRow key={routine.id} now={now} routine={routine} />
          ))}
        </ul>
      )}
      {!isPending && !error && routines.length === 0 && <Suggestions />}
      {showNewDialog && <NewRoutineDialog onClose={handleNewDialogClose} />}
    </section>
  );
};

export default RoutineList;
