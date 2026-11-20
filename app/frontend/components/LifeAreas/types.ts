import type { Task } from "@/apis/types";

// Where a dragged task can be dropped: an area, or the Inbox (no area).
export type DropTarget = { lifeAreaId: string | null; name: string };

// What a dragged task row carries.
export type DragData = { task: Task };
