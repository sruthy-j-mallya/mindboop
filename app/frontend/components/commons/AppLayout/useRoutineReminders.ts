import { useEffect, useRef } from "react";

import { format } from "date-fns";
import { toast } from "sonner";

import type { Routine } from "@/apis/types";
import { useRoutines } from "@/hooks/reactQuery/useRoutinesApi";
import useStartRoutine from "@/hooks/useStartRoutine";
import { formatMinutes } from "@/utils";
import { showNotification } from "@/utils/notifications";
import { readStorage, writeStorage } from "@/utils/storage";

import { REMINDED_ON_STORAGE_KEY, REMINDER_CHECK_INTERVAL, REMINDER_TOAST_DURATION } from "./constants";
import { isReminderDue } from "./utils";

const DAY_FORMAT = "yyyy-MM-dd";

const readRemindedOn = (): Record<string, string> => {
  try {
    return JSON.parse(readStorage(REMINDED_ON_STORAGE_KEY) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
};

// Shows each routine's reminder once on its days, while a tab is open: a toast with Start, and a system notification
// when allowed. Gentle by design: "Not now" just closes it, and nothing records a reminder that was ignored.
const useRoutineReminders = () => {
  const { data: routines = [] } = useRoutines();
  const { startRoutine } = useStartRoutine();
  // The latest, for the interval's callback.
  const startRoutineRef = useRef(startRoutine);

  useEffect(() => {
    startRoutineRef.current = startRoutine;
  });

  useEffect(() => {
    const remind = (routine: Routine) => {
      const { id, title, durationMinutes } = routine;
      const body = `${formatMinutes(durationMinutes)}, whenever you’re ready.`;
      toast(`Time for ${title}?`, {
        id: `routine-reminder-${id}`,
        description: body,
        duration: REMINDER_TOAST_DURATION,
        action: { label: "Start", onClick: () => startRoutineRef.current(routine) },
        cancel: { label: "Not now", onClick: () => undefined },
      });
      showNotification({ tag: `routine-reminder-${id}`, title: `Time for ${title}?`, body });
    };

    const check = () => {
      const now = new Date();
      const today = format(now, DAY_FORMAT);
      const remindedOn = readRemindedOn();
      const due = routines.filter(
        (routine) => remindedOn[routine.id] !== today && isReminderDue(routine, now),
      );
      if (due.length === 0) return;

      writeStorage(
        REMINDED_ON_STORAGE_KEY,
        JSON.stringify({ ...remindedOn, ...Object.fromEntries(due.map(({ id }) => [id, today])) }),
      );
      due.forEach(remind);
    };

    check();
    const interval = window.setInterval(check, REMINDER_CHECK_INTERVAL);

    return () => window.clearInterval(interval);
  }, [routines]);
};

export default useRoutineReminders;
