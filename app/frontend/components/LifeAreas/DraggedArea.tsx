import { GripVertical } from "lucide-react";

import type { LifeArea } from "@/apis/types";
import LifeAreaBadge from "@/components/commons/LifeArea/Badge";

type DraggedAreaProps = { lifeArea: LifeArea };

// What follows the pointer while an area is dragged to another place.
const DraggedArea = ({ lifeArea: { name, color, emoji } }: DraggedAreaProps) => (
  <div className="flex cursor-grabbing items-center gap-2 rounded-md border bg-card py-1.5 pr-2 text-sm shadow-lg">
    <GripVertical className="-mr-1 size-4 shrink-0 text-muted-foreground" />
    <LifeAreaBadge className="size-5 text-xs" color={color} emoji={emoji} />
    <span className="truncate">{name}</span>
  </div>
);

export default DraggedArea;
