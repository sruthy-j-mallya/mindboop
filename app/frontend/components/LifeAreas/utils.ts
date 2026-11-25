import {
  type Active,
  type Announcements,
  closestCenter,
  type CollisionDetection,
  defaultKeyboardCoordinateGetter,
  type KeyboardCoordinateGetter,
  type Over,
  rectIntersection,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import type { TaskCount } from "@/apis/types";

import { DRAG_TYPES, INBOX_DROP_ID } from "./constants";
import type { DragData, DropData, DropTarget } from "./types";

export const getTargetId = ({ lifeAreaId }: DropTarget) => lifeAreaId ?? INBOX_DROP_ID;

// The count for an area, or for the Inbox (null).
export const getTasksCount = (taskCounts: TaskCount[], lifeAreaId: string | null) =>
  taskCounts.find((taskCount) => taskCount.lifeAreaId === lifeAreaId)?.tasksCount ?? 0;

export const getTasksCountLabel = (count: number) => (count === 1 ? "1 task" : `${count} tasks`);

export const getAddAreasLabel = (count: number) => {
  if (count === 0) return "Add areas";

  return count === 1 ? "Add 1 area" : `Add ${count} areas`;
};

export const getDragData = (active: Pick<Active, "data"> | null) =>
  active?.data.current as DragData | undefined;

export const getDropTarget = (over: Pick<Over, "data"> | null) =>
  (over?.data.current as DropData | undefined)?.target;

const isAreaDrag = (active: Pick<Active, "data"> | null) => getDragData(active)?.type === DRAG_TYPES.AREA;

// The place an area lands on when dropped on another, or null when that's nowhere new.
export const getAreaPosition = (areaIds: string[], id: string, target: DropTarget | undefined) => {
  if (!target?.lifeAreaId || target.lifeAreaId === id) return null;

  const position = areaIds.indexOf(target.lifeAreaId);

  return position === -1 ? null : position;
};

// An area always has a nearest place to land; a task has to be over where it's dropped.
export const detectCollisions: CollisionDetection = (args) =>
  isAreaDrag(args.active) ? closestCenter(args) : rectIntersection(args);

// The arrow keys take an area from place to place, and a task a little way at a time.
export const getKeyboardCoordinates: KeyboardCoordinateGetter = (event, args) =>
  isAreaDrag(args.context.active)
    ? sortableKeyboardCoordinates(event, args)
    : defaultKeyboardCoordinateGetter(event, args);

const getDragName = (active: Active) => {
  const data = getDragData(active);
  if (!data) return "";

  return data.type === DRAG_TYPES.TASK ? data.task.title : data.lifeArea.name;
};

// dnd-kit announces raw ids by default, which are meaningless UUIDs.
export const DRAG_ANNOUNCEMENTS: Announcements = {
  onDragStart: ({ active }) => `Picked up ${getDragName(active)}.`,
  onDragOver: ({ active, over }) => {
    const target = getDropTarget(over);
    if (!target || active.id === over?.id) return undefined;

    return `${getDragName(active)} moved over ${target.name}.`;
  },
  onDragEnd: ({ active, over }) => {
    const target = getDropTarget(over);
    if (!target || active.id === over?.id) return `${getDragName(active)} dropped.`;

    return `${getDragName(active)} dropped over ${target.name}.`;
  },
  onDragCancel: ({ active }) => `Cancelled. ${getDragName(active)} went back to where it was.`,
};
