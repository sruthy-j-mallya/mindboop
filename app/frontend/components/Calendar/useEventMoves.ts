import { useState } from "react";

import type { EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import { toast } from "sonner";

import type { ApiError } from "@/apis/axios";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";
import { useUpdateTimeLog } from "@/hooks/reactQuery/useTimeLogsApi";

import { EVENT_KINDS } from "./constants";
import type { CalendarEvent, EventTimes } from "./types";
import { getMovedTaskSchedule, getMoveError } from "./utils";

type MoveArgs = EventInteractionArgs<CalendarEvent>;

// Saves a drag or a resize on the grid. The event stays where it was dropped (`movedTimes`) until the save settles and
// the refetched calendar agrees; a refused or failed move goes back, with a toast saying why.
const useEventMoves = (isMonthView: boolean) => {
  const [movedTimes, setMovedTimes] = useState<Record<string, EventTimes>>({});
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: updateTimeLog } = useUpdateTimeLog();

  const settle = (id: string) =>
    setMovedTimes((current) => Object.fromEntries(Object.entries(current).filter(([key]) => key !== id)));

  const handleMoveFailed = (error: ApiError) => toast.error(error.message);

  const saveMove = ({ event, start, end, isAllDay }: MoveArgs, isResize: boolean) => {
    // The month view only moves events between days, so they keep being all day or timed.
    const times = {
      start: new Date(start),
      end: new Date(end),
      allDay: isMonthView ? event.allDay : !!isAllDay,
    };
    const moveError = getMoveError(event, times, isResize, Date.now());
    if (moveError) {
      toast.error(moveError);
      return;
    }

    setMovedTimes((current) => ({ ...current, [event.id]: times }));
    const callbacks = { onError: handleMoveFailed, onSettled: () => settle(event.id) };

    if (event.kind === EVENT_KINDS.TASK) {
      updateTask({ id: event.id, ...getMovedTaskSchedule(event.task, times, isResize) }, callbacks);
    } else {
      updateTimeLog(
        { id: event.id, startedAt: times.start.toISOString(), completedAt: times.end.toISOString() },
        callbacks,
      );
    }
  };

  const handleEventDrop = (args: MoveArgs) => saveMove(args, false);

  const handleEventResize = (args: MoveArgs) => saveMove(args, true);

  return { movedTimes, handleEventDrop, handleEventResize };
};

export default useEventMoves;
