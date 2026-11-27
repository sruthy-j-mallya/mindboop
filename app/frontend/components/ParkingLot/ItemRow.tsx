import { cn } from "cn";
import { Check, ListPlus, SquareArrowOutUpRight, Telescope, Undo2, Wind } from "lucide-react";
import { generatePath, Link } from "react-router";

import type { ParkingLotItem } from "@/apis/types";
import { CURIOSITY_MINUTES } from "@/components/commons/ParkingLot/constants";
import ThoughtCard from "@/components/commons/ParkingLot/ThoughtCard";
import SchedulePicker from "@/components/commons/SchedulePicker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import routes from "@/routes";

import useItemActions from "./useItemActions";

type ItemRowProps = {
  item: ParkingLotItem;
  isCuriosityRunning: boolean;
  isSelected: boolean;
  // A bulk action is moving this row.
  isBulkPending: boolean;
  onSelectedChange: (id: string, isSelected: boolean) => void;
};

// On phones the actions share a row of tall buttons, each with its label under the icon. While a curiosity time runs
// (on this row or another), Look into it waits; the running row gets an accent stripe and a note, so colour isn't the
// only signal. The checkbox picks the row for the bulk actions above the list.
const ItemRow = ({ item, isCuriosityRunning, isSelected, isBulkPending, onSelectedChange }: ItemRowProps) => {
  const { id, content, status, taskId, curiosityEndsAt } = item;
  const {
    lookIntoIt,
    addAsTask,
    markAddressed,
    parkAgain,
    letGo,
    isBusy: isRowBusy,
    error,
  } = useItemActions(id);
  const isLookingIntoIt = !!curiosityEndsAt;
  const isBusy = isRowBusy || isBulkPending;

  const handleCheckedChange = (checked: boolean | "indeterminate") => onSelectedChange(id, checked === true);

  return (
    <li className="grid gap-1">
      <div className="flex items-start gap-3">
        <Checkbox
          aria-label={`Select ${content}`}
          checked={isSelected}
          className="mt-3 border-muted-foreground/50"
          disabled={isBusy}
          onCheckedChange={handleCheckedChange}
        />
        <ThoughtCard
          className={cn(
            "min-w-0 flex-1",
            isBusy && "opacity-50",
            isLookingIntoIt && "border-l-4 border-l-primary",
          )}
          item={item}
        >
          <div className="-mr-1.5 flex items-center gap-0.5">
            {isLookingIntoIt && <span className="px-2 text-xs text-muted-foreground">Looking into it</span>}
            {status === "parked" && !isLookingIntoIt && (
              <Button
                disabled={isBusy || isCuriosityRunning}
                size="xs"
                type="button"
                variant="ghost"
                onClick={lookIntoIt}
              >
                <Telescope />
                <span className="max-sm:sr-only">Look into it · {CURIOSITY_MINUTES} min</span>
              </Button>
            )}
            {status === "parked" && (
              <>
                <SchedulePicker
                  align="center"
                  clearLabel="Add undated"
                  saveLabel="Add"
                  side="left"
                  onSave={addAsTask}
                >
                  <Button disabled={isBusy} size="xs" type="button" variant="ghost">
                    <ListPlus />
                    <span className="max-sm:sr-only">Add as task</span>
                  </Button>
                </SchedulePicker>
                <Button disabled={isBusy} size="xs" type="button" variant="ghost" onClick={markAddressed}>
                  <Check />
                  <span className="max-sm:sr-only">Mark addressed</span>
                </Button>
              </>
            )}
            {status === "addressed" && (
              <Button disabled={isBusy} size="xs" type="button" variant="ghost" onClick={parkAgain}>
                <Undo2 />
                <span className="max-sm:sr-only">Park again</span>
              </Button>
            )}
            {status === "converted" && taskId && (
              <Button asChild size="xs" variant="ghost">
                <Link to={generatePath(routes.inbox.show, { taskId })}>
                  <SquareArrowOutUpRight />
                  <span className="max-sm:sr-only">Open task</span>
                </Link>
              </Button>
            )}
            <Button disabled={isBusy} size="xs" type="button" variant="ghost" onClick={letGo}>
              <Wind />
              <span className="max-sm:sr-only">Let it go</span>
            </Button>
          </div>
        </ThoughtCard>
      </div>
      {error && (
        <p className="px-3 text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
    </li>
  );
};

export default ItemRow;
