import { cn } from "cn";
import type { ReactNode } from "react";

import type { ParkingLotItem } from "@/apis/types";
import useCurrentTime from "@/hooks/useCurrentTime";
import useDatePreferences from "@/hooks/useDatePreferences";

import { formatParkedAt } from "./utils";

type ThoughtCardProps = {
  item: ParkingLotItem;
  className?: string;
  children?: ReactNode;
};

// A parked thought on a plain surface, kept quiet for sensory comfort. `children` holds any actions, beside the time.
// The time is read once: a thought parked today only reads as another day after midnight, which a reload or tab change
// fixes.
const ThoughtCard = ({ item: { content, createdAt }, className, children }: ThoughtCardProps) => {
  const { timeFormat } = useDatePreferences();
  const now = useCurrentTime(false);

  return (
    <div className={cn("grid gap-0.5 rounded-xl border bg-card px-3 py-2", className)}>
      <p className="text-sm wrap-anywhere whitespace-pre-wrap">{content}</p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          <time dateTime={createdAt}>{formatParkedAt(createdAt, now, timeFormat)}</time>
        </p>
        {children}
      </div>
    </div>
  );
};

export default ThoughtCard;
