import { useNavigate } from "react-router";
import { toast } from "sonner";

import type { Routine } from "@/apis/types";
import { useCurrentTimeLog } from "@/hooks/reactQuery/useCurrentTimeLogsApi";
import { useCreateTimeLog } from "@/hooks/reactQuery/useTimeLogsApi";
import routes from "@/routes";
import { unlockAudio } from "@/utils/audioContext";

// Starts a timer on a routine and opens the Timer. One thing at a time: with a session already running, it leads to
// that session instead.
const useStartRoutine = () => {
  const navigate = useNavigate();
  const { data: timeLog, isPending: isLoadingSession } = useCurrentTimeLog();
  const { mutate: createTimeLog, isPending: isStarting } = useCreateTimeLog();

  const startRoutine = ({ id, title }: Pick<Routine, "id" | "title">) => {
    if (timeLog) {
      if (timeLog.routineId !== id) toast(`Wrap up this session first, then ${title} is one click away.`);
      navigate(routes.timer);
      return;
    }

    // In the click, so the background sound can start once the Timer opens.
    unlockAudio();
    createTimeLog(
      { routineId: id, mode: "timer" },
      { onSuccess: () => navigate(routes.timer), onError: ({ message }) => toast.error(message) },
    );
  };

  return {
    startRoutine,
    isStarting: isStarting || isLoadingSession,
    runningRoutineId: timeLog?.routineId ?? null,
  };
};

export default useStartRoutine;
