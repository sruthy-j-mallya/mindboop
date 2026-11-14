import { cn } from "cn";
import { Check, ListPlus, SquareArrowOutUpRight, Trash2, Undo2 } from "lucide-react";
import { generatePath, Link } from "react-router";

import type { ParkingLotItem } from "@/apis/types";
import ThoughtCard from "@/components/commons/ParkingLot/ThoughtCard";
import { Button } from "@/components/ui/button";
import routes from "@/routes";

import useItemActions from "./useItemActions";

type ItemRowProps = { item: ParkingLotItem };

// Labels hide on narrow screens, where the buttons keep them as their accessible names.
const ItemRow = ({ item }: ItemRowProps) => {
  const { id, status, taskId } = item;
  const { addAsTask, markAddressed, parkAgain, discard, isBusy, error } = useItemActions(id);

  return (
    <li className="grid gap-1">
      <ThoughtCard className={cn(isBusy && "opacity-50")} item={item}>
        <div className="-mr-2 flex items-center gap-1">
          {status === "parked" && (
            <>
              <Button disabled={isBusy} size="sm" type="button" variant="ghost" onClick={addAsTask}>
                <ListPlus />
                <span className="max-sm:sr-only">Add as task</span>
              </Button>
              <Button disabled={isBusy} size="sm" type="button" variant="ghost" onClick={markAddressed}>
                <Check />
                <span className="max-sm:sr-only">Mark addressed</span>
              </Button>
            </>
          )}
          {status === "addressed" && (
            <Button disabled={isBusy} size="sm" type="button" variant="ghost" onClick={parkAgain}>
              <Undo2 />
              <span className="max-sm:sr-only">Park again</span>
            </Button>
          )}
          {status === "converted" && taskId && (
            <Button asChild size="sm" variant="ghost">
              <Link to={generatePath(routes.inbox.show, { taskId })}>
                <SquareArrowOutUpRight />
                <span className="max-sm:sr-only">Open task</span>
              </Link>
            </Button>
          )}
          <Button
            className="hover:text-destructive"
            disabled={isBusy}
            size="sm"
            type="button"
            variant="ghost"
            onClick={discard}
          >
            <Trash2 />
            <span className="max-sm:sr-only">Discard</span>
          </Button>
        </div>
      </ThoughtCard>
      {error && (
        <p className="px-4 text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
    </li>
  );
};

export default ItemRow;
