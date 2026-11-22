import { cn } from "cn";

import type { Routine } from "@/apis/types";
import { toAreaColorStyle } from "@/components/commons/LifeArea/utils";

import { findRoutineIcon } from "./utils";

type RoutineBadgeProps = Pick<Routine, "color" | "icon"> & { className?: string; iconClassName?: string };

// A routine's icon on a round tile of its colour.
const RoutineBadge = ({ color, icon, className, iconClassName }: RoutineBadgeProps) => {
  const { icon: Icon } = findRoutineIcon(icon);

  return (
    <span
      aria-hidden
      className={cn("area-tint flex size-10 shrink-0 items-center justify-center", className)}
      style={toAreaColorStyle(color)}
    >
      <Icon className={cn("size-5", iconClassName)} />
    </span>
  );
};

export default RoutineBadge;
