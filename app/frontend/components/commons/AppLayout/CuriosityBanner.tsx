import { toast } from "sonner";

import type { ParkingLotItem } from "@/apis/types";
import { CURIOSITY_MINUTES } from "@/components/commons/ParkingLot/constants";
import SchedulePicker from "@/components/commons/SchedulePicker";
import type { SchedulePayload } from "@/components/commons/SchedulePicker/types";
import { Button } from "@/components/ui/button";
import { useEndCuriosityTime, useExtendCuriosityTime } from "@/hooks/reactQuery/useCuriosityTimesApi";
import { useConvertParkingLotItem } from "@/hooks/reactQuery/useParkingLotItemConversionsApi";
import { useUpdateParkingLotItem } from "@/hooks/reactQuery/useParkingLotItemsApi";
import useCurrentTime from "@/hooks/useCurrentTime";
import { formatRemainingTime, getRemainingSeconds } from "@/utils";

type CuriosityBannerProps = { item: ParkingLotItem; endsAt: string; isOver: boolean };

// The running curiosity time: the thought and the time left, then "Got your answer?" once it's up. Each way out ends
// it: done, needs real time (add as a task), or not now (stays parked). More time is offered once.
const CuriosityBanner = ({
  item: { id, content, isCuriosityExtended },
  endsAt,
  isOver,
}: CuriosityBannerProps) => {
  const currentTime = useCurrentTime(!isOver);
  const { mutate: updateItem, isPending: isUpdating, error: updateError } = useUpdateParkingLotItem();
  const { mutate: convertItem, isPending: isConverting, error: convertError } = useConvertParkingLotItem();
  const { mutate: extendTime, isPending: isExtending, error: extendError } = useExtendCuriosityTime();
  const { mutate: endTime, isPending: isEnding, error: endError } = useEndCuriosityTime();
  const isBusy = isUpdating || isConverting || isExtending || isEnding;
  const error = updateError ?? convertError ?? extendError ?? endError;

  const handleDone = () => updateItem({ id, status: "addressed" });

  const handleAddAsTask = (schedule: SchedulePayload) =>
    convertItem({ parkingLotItemId: id, ...schedule }, { onSuccess: () => toast("Added to your Inbox") });

  const handleMoreTime = () => extendTime(undefined);

  const handleNotNow = () => endTime(undefined);

  return (
    <section
      aria-label="Curiosity time"
      className="flex flex-col gap-3 rounded-2xl border border-l-4 border-l-primary bg-card p-4"
    >
      <div className="grid gap-1">
        <p className="text-sm text-muted-foreground">
          {isOver
            ? "Time's up. Got your answer?"
            : `Curiosity time · ${formatRemainingTime(getRemainingSeconds(endsAt, currentTime))} left`}
        </p>
        <p className="font-semibold wrap-anywhere">{content}</p>
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button disabled={isBusy} type="button" onClick={handleDone}>
          Done, mark addressed
        </Button>
        {isOver && (
          <SchedulePicker clearLabel="Add undated" saveLabel="Add" onSave={handleAddAsTask}>
            <Button disabled={isBusy} type="button" variant="outline">
              Needs real time: add as task
            </Button>
          </SchedulePicker>
        )}
        {isOver && !isCuriosityExtended && (
          <Button disabled={isBusy} type="button" variant="outline" onClick={handleMoreTime}>
            {CURIOSITY_MINUTES} more minutes
          </Button>
        )}
        <Button disabled={isBusy} type="button" variant="ghost" onClick={handleNotNow}>
          Not now
        </Button>
      </div>
    </section>
  );
};

export default CuriosityBanner;
