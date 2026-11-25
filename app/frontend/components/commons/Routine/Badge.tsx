import { cn } from "cn";

import type { Routine } from "@/apis/types";
import { toAreaColorStyle } from "@/components/commons/LifeArea/utils";

type RoutineBadgeProps = Pick<Routine, "color" | "emoji"> & { className?: string };

// A routine's emoji on a circle of its colour.
const RoutineBadge = ({ color, emoji, className }: RoutineBadgeProps) => (
  <span
    aria-hidden
    style={toAreaColorStyle(color)}
    className={cn(
      "area-tint flex size-10 shrink-0 items-center justify-center rounded-full text-xl leading-none",
      className,
    )}
  >
    {emoji}
  </span>
);

export default RoutineBadge;
