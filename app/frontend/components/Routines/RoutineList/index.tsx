import { useState } from "react";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "cn";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import type { ApiError } from "@/apis/axios";
import ListSkeleton from "@/components/commons/ListSkeleton";
import { Button } from "@/components/ui/button";
import { useMoveRoutine, useRoutines } from "@/hooks/reactQuery/useRoutinesApi";
import useDroppedOrder from "@/hooks/useDroppedOrder";

import NewRoutineDialog from "../RoutineDialog/New";
import RoutineRow from "./RoutineRow";
import Suggestions from "./Suggestions";
import { ROUTINE_ANNOUNCEMENTS } from "./utils";

type RoutineListProps = { className?: string };

// Every routine, in the order the user drags them into (a new one goes last), with the ideas to start with until
// there's one.
const RoutineList = ({ className }: RoutineListProps) => {
  const { data: fetchedRoutines = [], isPending, error } = useRoutines();
  const { mutate: moveRoutine } = useMoveRoutine();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [routines, showMove] = useDroppedOrder(fetchedRoutines);
  // Read once per render, so "Today" and "Yesterday" agree across rows.
  const now = new Date();

  const handleAdd = () => setShowNewDialog(true);
  const handleNewDialogClose = () => setShowNewDialog(false);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleMoveError = (moveError: ApiError) => toast.error(moveError.message);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const id = String(active.id);
    const position = routines.findIndex((routine) => routine.id === over.id);
    if (position === -1) return;

    showMove(id, position);
    moveRoutine({ id, position }, { onError: handleMoveError });
  };

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
      {isPending && <ListSkeleton className="px-2" />}
      {!isPending && routines.length > 0 && (
        <DndContext
          accessibility={{ announcements: ROUTINE_ANNOUNCEMENTS }}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          sensors={sensors}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={routines} strategy={verticalListSortingStrategy}>
            <ul aria-label="Routines" className="grid gap-0.5">
              {routines.map((routine) => (
                <RoutineRow key={routine.id} now={now} routine={routine} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
      {!isPending && !error && routines.length === 0 && <Suggestions />}
      {showNewDialog && <NewRoutineDialog onClose={handleNewDialogClose} />}
    </section>
  );
};

export default RoutineList;
