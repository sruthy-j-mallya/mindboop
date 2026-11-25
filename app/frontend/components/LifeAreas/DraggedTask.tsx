import { GripVertical } from "lucide-react";

type DraggedTaskProps = { title: string };

// What follows the pointer while a task is dragged to another area.
const DraggedTask = ({ title }: DraggedTaskProps) => (
  <div className="flex max-w-72 cursor-grabbing items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm shadow-lg">
    <GripVertical className="size-4 shrink-0 text-muted-foreground" />
    <span className="truncate">{title}</span>
  </div>
);

export default DraggedTask;
