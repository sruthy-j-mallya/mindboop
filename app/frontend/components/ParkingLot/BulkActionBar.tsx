import { cn } from "cn";
import { Check, Wind } from "lucide-react";

import type { ParkingLotItemStatus } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { INDETERMINATE_CHECKBOX_CLASS_NAME } from "./constants";
import { countThoughts } from "./utils";

type BulkActionBarProps = {
  status: ParkingLotItemStatus;
  itemCount: number;
  selectedCount: number;
  isPending: boolean;
  onSelectAll: (isSelected: boolean) => void;
  onMarkAddressed: () => void;
  onLetGo: () => void;
};

// Sits above a list: a Select all box, and once something is selected, the actions to take on all of it. Only parked
// thoughts can be marked addressed; any thought can be let go.
const BulkActionBar = ({
  status,
  itemCount,
  selectedCount,
  isPending,
  onSelectAll,
  onMarkAddressed,
  onLetGo,
}: BulkActionBarProps) => {
  const isAllSelected = selectedCount === itemCount;
  const checked = isAllSelected || (selectedCount > 0 && "indeterminate");

  const handleCheckedChange = () => onSelectAll(!isAllSelected);

  return (
    <div
      aria-label="Bulk actions"
      className="flex min-h-8 flex-wrap items-center gap-x-3 gap-y-1"
      role="toolbar"
    >
      <Checkbox
        aria-label="Select all"
        checked={checked}
        className={cn("border-muted-foreground/50", INDETERMINATE_CHECKBOX_CLASS_NAME)}
        disabled={isPending}
        onCheckedChange={handleCheckedChange}
      />
      <span aria-live="polite" className="text-xs text-muted-foreground">
        {selectedCount > 0 ? `${countThoughts(selectedCount)} selected` : "Select all"}
      </span>
      {selectedCount > 0 && (
        <div className="ml-auto flex items-center gap-0.5">
          {status === "parked" && (
            <Button disabled={isPending} size="xs" type="button" variant="ghost" onClick={onMarkAddressed}>
              <Check />
              Mark addressed
            </Button>
          )}
          <Button disabled={isPending} size="xs" type="button" variant="ghost" onClick={onLetGo}>
            <Wind />
            Let it go
          </Button>
        </div>
      )}
    </div>
  );
};

export default BulkActionBar;
