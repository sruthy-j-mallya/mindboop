import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { formatRemainingTime } from "@/utils";

type OverrunToggleProps = { seconds: number; isDiscarded: boolean; onToggle: () => void };

// Under a timer that ran past zero: how far past it is, and whether that extra time goes into the log when the
// session ends. Pressed (the default) keeps it; unpressed logs the session at its planned time.
const OverrunToggle = ({ seconds, isDiscarded, onToggle }: OverrunToggleProps) => (
  <>
    <Button
      aria-pressed={!isDiscarded}
      className="rounded-full tabular-nums"
      size="sm"
      title={isDiscarded ? "Log the extra time" : "Leave the extra time out"}
      type="button"
      variant={isDiscarded ? "outline" : "secondary"}
      onClick={onToggle}
    >
      <span className={cn(isDiscarded && "line-through")}>+{formatRemainingTime(seconds)}</span> extra
    </Button>
    <p className="text-xs text-muted-foreground">
      {isDiscarded ? "left out of the log" : "counted in the log"}
    </p>
  </>
);

export default OverrunToggle;
