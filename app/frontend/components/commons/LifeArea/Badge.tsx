import { cn } from "cn";

import type { LifeArea } from "@/apis/types";

import { toAreaColorStyle } from "./utils";

type LifeAreaBadgeProps = Pick<LifeArea, "color" | "emoji"> & { className?: string };

// An area's emoji on a circle of its colour.
const LifeAreaBadge = ({ color, emoji, className }: LifeAreaBadgeProps) => (
  <span
    aria-hidden
    style={toAreaColorStyle(color)}
    className={cn(
      "area-tint flex size-6 shrink-0 items-center justify-center rounded-full text-sm leading-none",
      className,
    )}
  >
    {emoji}
  </span>
);

export default LifeAreaBadge;
