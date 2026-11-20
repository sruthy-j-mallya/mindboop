import { useState } from "react";

import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Outlet } from "react-router";

import type { Task } from "@/apis/types";

import AreaNav from "./AreaNav";
import DraggedTask from "./DraggedTask";
import type { DragData, DropTarget } from "./types";
import useMoveTask from "./useMoveTask";

// A press that moves this far is a drag; anything less is a click.
const DRAG_DISTANCE = 4;

// The areas of life beside the task list of the one picked (or the Inbox's). Tasks are dragged from the list onto an
// area, or the Inbox, to move them there.
const LifeAreas = () => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const moveTask = useMoveTask();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_DISTANCE } }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = ({ active }: DragStartEvent) =>
    setDraggedTask((active.data.current as DragData | undefined)?.task ?? null);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setDraggedTask(null);
    const task = (active.data.current as DragData | undefined)?.task;
    const target = over?.data.current as DropTarget | undefined;
    if (task && target) moveTask(task, target);
  };

  const handleDragCancel = () => setDraggedTask(null);

  return (
    <DndContext
      sensors={sensors}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
    >
      <div className="flex flex-1 flex-col lg:basis-0 lg:flex-row lg:overflow-hidden">
        <AreaNav />
        <Outlet />
      </div>
      <DragOverlay dropAnimation={null}>
        {draggedTask && <DraggedTask title={draggedTask.title} />}
      </DragOverlay>
    </DndContext>
  );
};

export default LifeAreas;
