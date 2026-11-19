import { cn } from "cn";

import type { LifeArea } from "@/apis/types";
import { findLifeAreaIcon } from "@/components/commons/LifeArea/utils";

import { toAreaColorStyle } from "./utils";

type AreaBadgeProps = Pick<LifeArea, "color" | "icon"> & { className?: string };

// An area's icon on a tile of its colour.
const AreaBadge = ({ color, icon, className }: AreaBadgeProps) => {
  const lifeAreaIcon = findLifeAreaIcon(icon);
  const Icon = lifeAreaIcon.icon;

  return (
    <span
      aria-hidden
      className={cn("area-tint flex size-6 shrink-0 items-center justify-center rounded-md", className)}
      style={toAreaColorStyle(color)}
    >
      <Icon className="size-3.5" />
    </span>
  );
};

export default AreaBadge;
