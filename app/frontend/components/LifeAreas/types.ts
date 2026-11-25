import type { LifeArea, Task } from "@/apis/types";

import type { DRAG_TYPES } from "./constants";

// Where a dragged task can be dropped, or a deleted area's tasks moved: an area, or the Inbox (no area).
export type DropTarget = { lifeAreaId: string | null; name: string };

// What a dragged task row or area carries.
export type DragData =
  { type: typeof DRAG_TYPES.TASK; task: Task } | { type: typeof DRAG_TYPES.AREA; lifeArea: LifeArea };

// What the Inbox or an area carries as a drop target.
export type DropData = { target: DropTarget };
