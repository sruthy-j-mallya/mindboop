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

import useOpenTask from "@/hooks/useOpenTask";

import AreaNav from "./AreaNav";
import { DRAG_TYPES } from "./constants";
import DraggedArea from "./DraggedArea";
import DraggedTask from "./DraggedTask";
import type { DragData } from "./types";
import useMoveArea from "./useMoveArea";
import useMoveTask from "./useMoveTask";
import {
  detectCollisions,
  DRAG_ANNOUNCEMENTS,
  getDragData,
  getDropTarget,
  getKeyboardCoordinates,
} from "./utils";

// A press that moves this far is a drag; anything less is a click.
const DRAG_DISTANCE = 4;

// The areas of life beside the task list of the one picked (or the Inbox's). Tasks are dragged from the list onto an
// area, or the Inbox, to move them there, and areas onto each other to reorder them. Both share one context, as areas
// are drop targets for either.
const LifeAreas = () => {
  const [dragged, setDragged] = useState<DragData | null>(null);
  const isTaskOpen = !!useOpenTask().openTaskId;
  const moveTask = useMoveTask();
  const moveArea = useMoveArea();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_DISTANCE } }),
    useSensor(KeyboardSensor, { coordinateGetter: getKeyboardCoordinates }),
  );

  const handleDragStart = ({ active }: DragStartEvent) => setDragged(getDragData(active) ?? null);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setDragged(null);
    const data = getDragData(active);
    const target = getDropTarget(over);
    if (data?.type === DRAG_TYPES.AREA) moveArea(data.lifeArea, target);
    else if (data && target) moveTask(data.task, target);
  };

  const handleDragCancel = () => setDragged(null);

  return (
    <DndContext
      accessibility={{ announcements: DRAG_ANNOUNCEMENTS }}
      collisionDetection={detectCollisions}
      sensors={sensors}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
    >
      <div className="flex flex-1 flex-col lg:basis-0 lg:flex-row lg:overflow-hidden">
        {/* On narrow screens an open task takes the whole page, with a way back to its list. */}
        <AreaNav className={isTaskOpen ? "max-lg:hidden" : undefined} />
        <Outlet />
      </div>
      <DragOverlay dropAnimation={null}>
        {dragged?.type === DRAG_TYPES.TASK && <DraggedTask title={dragged.task.title} />}
        {dragged?.type === DRAG_TYPES.AREA && <DraggedArea lifeArea={dragged.lifeArea} />}
      </DragOverlay>
    </DndContext>
  );
};

export default LifeAreas;
