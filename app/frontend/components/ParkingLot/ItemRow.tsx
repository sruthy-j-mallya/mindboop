import { cn } from "cn";
import { Check, ListPlus, SquareArrowOutUpRight, Telescope, Undo2, Wind } from "lucide-react";
import { generatePath, Link } from "react-router";

import type { ParkingLotItem } from "@/apis/types";
import { CURIOSITY_MINUTES } from "@/components/commons/ParkingLot/constants";
import ThoughtCard from "@/components/commons/ParkingLot/ThoughtCard";
import SchedulePicker from "@/components/commons/SchedulePicker";
import { Button } from "@/components/ui/button";
import routes from "@/routes";

import useItemActions from "./useItemActions";

const ACTION_CLASS_NAME =
  "max-sm:h-12 max-sm:min-w-0 max-sm:flex-1 max-sm:flex-col max-sm:text-[11px] max-sm:leading-tight max-sm:whitespace-normal max-sm:has-[>svg]:px-0.5 max-sm:[&_svg:not([class*='size-'])]:size-4";

type ItemRowProps = { item: ParkingLotItem; isCuriosityRunning: boolean };

// On phones the actions share a row of tall buttons, each with its label under the icon. While a curiosity time runs
// (on this row or another), Look into it waits; the running row gets an accent stripe and a note, so colour isn't the
// only signal.
const ItemRow = ({ item, isCuriosityRunning }: ItemRowProps) => {
  const { id, status, taskId, curiosityEndsAt } = item;
  const { lookIntoIt, addAsTask, markAddressed, parkAgain, letGo, isBusy, error } = useItemActions(id);
  const isLookingIntoIt = !!curiosityEndsAt;

  return (
    <li className="grid gap-1">
      <ThoughtCard
        className={cn(isBusy && "opacity-50", isLookingIntoIt && "border-l-4 border-l-primary")}
        item={item}
      >
        <div className="-mr-1.5 flex items-center gap-0.5 max-sm:-mx-2 max-sm:w-[calc(100%+1rem)]">
          {isLookingIntoIt && <span className="px-2 text-xs text-muted-foreground">Looking into it</span>}
          {status === "parked" && !isLookingIntoIt && (
            <Button
              disabled={isBusy || isCuriosityRunning}
              className={ACTION_CLASS_NAME}
              size="xs"
              type="button"
              variant="ghost"
              onClick={lookIntoIt}
            >
              <Telescope />
              <span>
                Look into it <span className="max-sm:sr-only">· {CURIOSITY_MINUTES} min</span>
              </span>
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
                <Button
                  disabled={isBusy}
                  className={ACTION_CLASS_NAME}
                  size="xs"
                  type="button"
                  variant="ghost"
                >
                  <ListPlus />
                  <span>Add as task</span>
                </Button>
              </SchedulePicker>
              <Button
                disabled={isBusy}
                className={ACTION_CLASS_NAME}
                size="xs"
                type="button"
                variant="ghost"
                onClick={markAddressed}
              >
                <Check />
                <span>Mark addressed</span>
              </Button>
            </>
          )}
          {status === "addressed" && (
            <Button
              disabled={isBusy}
              className={ACTION_CLASS_NAME}
              size="xs"
              type="button"
              variant="ghost"
              onClick={parkAgain}
            >
              <Undo2 />
              <span>Park again</span>
            </Button>
          )}
          {status === "converted" && taskId && (
            <Button asChild className={ACTION_CLASS_NAME} size="xs" variant="ghost">
              <Link to={generatePath(routes.inbox.show, { taskId })}>
                <SquareArrowOutUpRight />
                <span>Open task</span>
              </Link>
            </Button>
          )}
          <Button
            disabled={isBusy}
            className={ACTION_CLASS_NAME}
            size="xs"
            type="button"
            variant="ghost"
            onClick={letGo}
          >
            <Wind />
            <span>Let it go</span>
          </Button>
        </div>
      </ThoughtCard>
      {error && (
        <p className="px-3 text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
    </li>
  );
};

export default ItemRow;
