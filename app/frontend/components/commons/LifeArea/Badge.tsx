import { cn } from "cn";

import type { LifeArea } from "@/apis/types";

import { findLifeAreaIcon, toAreaColorStyle } from "./utils";

type LifeAreaBadgeProps = Pick<LifeArea, "color" | "icon"> & { className?: string };

// An area's icon on a tile of its colour.
const LifeAreaBadge = ({ color, icon, className }: LifeAreaBadgeProps) => {
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

export default LifeAreaBadge;
