import { cn } from "cn";
import type { ReactNode } from "react";

import type { ParkingLotItem } from "@/apis/types";
import useCurrentTime from "@/hooks/useCurrentTime";

import { KIND_CLASS_NAMES } from "./constants";
import { formatParkedAt } from "./utils";

type ThoughtCardProps = {
  item: ParkingLotItem;
  className?: string;
  children?: ReactNode;
};

// A parked thought, tinted by its kind. `children` holds any actions, under the text. The time is read once: a
// thought parked today only reads as another day after midnight, which a reload or tab change fixes.
const ThoughtCard = ({ item: { content, kind, createdAt }, className, children }: ThoughtCardProps) => {
  const now = useCurrentTime(false);

  return (
    <div className={cn("grid gap-1 rounded-2xl px-4 py-3", KIND_CLASS_NAMES[kind], className)}>
      <p className="wrap-anywhere whitespace-pre-wrap">{content}</p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {kind} · <time dateTime={createdAt}>{formatParkedAt(createdAt, now)}</time>
        </p>
        {children}
      </div>
    </div>
  );
};

export default ThoughtCard;
