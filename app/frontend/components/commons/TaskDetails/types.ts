import type { Task } from "@/apis/types";

// What the line under the title shows of a task.
export type Detail = "schedule" | "estimate" | "lifeArea";

// A detail's picker is opened from its own button or, while it's unset and hidden, from the actions menu.
export type DetailPickerProps = { task: Task; isOpen: boolean; onOpenChange: (isOpen: boolean) => void };
