import { cn } from "cn";

import type { CreateCompletionPayload } from "@/apis/types";
import { useCurrentTimeLog } from "@/hooks/reactQuery/useCurrentTimeLogsApi";
import { useCompleteTimeLog } from "@/hooks/reactQuery/useTimeLogCompletionsApi";
import { useUserPreference } from "@/hooks/reactQuery/useUserPreferencesApi";
import { unlockAudio } from "@/utils/audioContext";
import { playCompletionSound } from "@/utils/completionSound";

import FinishedDialog from "./FinishedDialog";
import ParkingLot from "./ParkingLot";
import Session from "./Session";
import Setup from "./Setup";

const Timer = () => {
  const { data: timeLog, isPending, error } = useCurrentTimeLog();
  const { data: preference } = useUserPreference();
  // Lives here and not in Session, which unmounts as soon as the completed log stops being the current one.
  const {
    mutate: completeTimeLog,
    data: completion,
    isPending: isCompleting,
    error: completionError,
    reset: resetCompletion,
  } = useCompleteTimeLog();

  // Unlocked in the click, so the chime can play once the save lands and the finished dialog opens.
  const handleDone = (payload: CreateCompletionPayload) => {
    unlockAudio();
    completeTimeLog(payload, { onSuccess: () => playCompletionSound(preference?.completionSound) });
  };

  if (isPending) return null;

  return (
    <div className={cn("mx-auto flex w-full max-w-5xl flex-1 flex-col p-4", timeLog && "xl:max-w-7xl")}>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
      {/* The parking lot sits beside the session on wide screens, and under it otherwise. */}
      {!error && timeLog && (
        <div className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <Session
            key={timeLog.id}
            completionError={completionError?.message}
            isCompleting={isCompleting}
            timeLog={timeLog}
            onDone={handleDone}
          />
          <ParkingLot
            className="mx-auto h-[28rem] w-full max-w-2xl lg:max-w-5xl xl:sticky xl:top-4 xl:h-[calc(100svh-6rem)] xl:max-w-none xl:self-start"
            timeLogId={timeLog.id}
          />
        </div>
      )}
      {!error && !timeLog && <Setup />}
      {completion && (
        <FinishedDialog
          isFinishedEarly={completion.timeLog.isFinishedEarly}
          timeLogId={completion.timeLog.id}
          onClose={resetCompletion}
        />
      )}
    </div>
  );
};

export default Timer;
