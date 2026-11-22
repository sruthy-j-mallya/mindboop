import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatRemainingTime } from "@/utils";

type OverrunToggleProps = { seconds: number; isIncluded: boolean; onToggle: () => void };

// Under a timer that ran past zero: how far past it is, and whether that extra time goes into the log when the
// session ends. It's left out by default (the session logs at its planned time); + adds it, − takes it back out.
const OverrunToggle = ({ seconds, isIncluded, onToggle }: OverrunToggleProps) => (
  <>
    <Button
      aria-label={isIncluded ? "Remove the extra time from the log" : "Add the extra time to the log"}
      className="tabular-nums"
      size="sm"
      title={isIncluded ? "Remove the extra time from the log" : "Add the extra time to the log"}
      type="button"
      variant={isIncluded ? "outline" : "secondary"}
      onClick={onToggle}
    >
      {isIncluded ? <Minus /> : <Plus />}
      {formatRemainingTime(seconds)}
    </Button>
    <p className="text-xs text-muted-foreground">
      {isIncluded ? "extra time logged" : "extra time not logged"}
    </p>
  </>
);

export default OverrunToggle;
