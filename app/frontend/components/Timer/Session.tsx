import { useState } from "react";

import { cn } from "cn";
import { LogOut, PartyPopper, Pause, Plus, X } from "lucide-react";

import type { CreateCompletionPayload, TimeLog } from "@/apis/types";
import AmbiencePicker from "@/components/commons/Ambience/Picker";
import BailDialog from "@/components/commons/BailDialog";
import BreakBanner from "@/components/commons/BreakBanner";
import TaskDetails from "@/components/commons/TaskDetails";
import { Button } from "@/components/ui/button";
import { useTask } from "@/hooks/reactQuery/useTasksApi";
import useCurrentTime from "@/hooks/useCurrentTime";
import { getOverrunSeconds, isTooShortToKeep } from "@/utils/timeLogs";

import Clock from "./Clock";
import { ACTION_GRID_CLASSES } from "./constants";
import DiscardDialog from "./DiscardDialog";
import ExtendDialog from "./ExtendDialog";
import { MAX_EXTENSION_MINUTES } from "./ExtendDialog/constants";
import PauseDialog from "./PauseDialog";
import RoutineDetails from "./RoutineDetails";
import SessionCard from "./SessionCard";

type SessionProps = {
  timeLog: TimeLog;
  isCompleting: boolean;
  completionError?: string;
  onDone: (payload: CreateCompletionPayload) => void;
};

const Session = ({ timeLog, isCompleting, completionError, onDone }: SessionProps) => {
  // A session on the Timer runs on a task or on a routine; only a logged session can go without either.
  const { routineId } = timeLog;
  const {
    data: task,
    isPending,
    error,
  } = useTask(timeLog.taskId ?? "", { enabled: !routineId && !!timeLog.taskId });
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [showBailDialog, setShowBailDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [isDiscardChosen, setIsDiscardChosen] = useState(false);
  const [isOverrunIncluded, setIsOverrunIncluded] = useState(false);
  const { currentBreak } = timeLog;
  const isOnBreak = !!currentBreak;
  const currentTime = useCurrentTime(timeLog.isRunning || isOnBreak);
  // Once a timer runs past zero, the session can only end: there's nothing left to extend or pause.
  const hasOverrun = getOverrunSeconds(timeLog, currentTime) > 0;
  const discardOverrun = hasOverrun && !isOverrunIncluded;
  // A stopwatch has no end to push back.
  const canExtend = timeLog.mode === "timer" && !hasOverrun;
  const extensionMinutesLeft = MAX_EXTENSION_MINUTES - timeLog.bufferMinutes;
  // A routine has no task to leave breadcrumbs on, so instead of Bail it can be discarded at any time.
  const canBail = !routineId;
  const actionCount = Number(canExtend) + Number(!hasOverrun) + 2;

  // A session too short to log can only be discarded, whether it's ended with Bail or Done. Decided on the click, so
  // the open dialog doesn't change when the elapsed time crosses the limit.
  const isTooShort = () => isTooShortToKeep(timeLog, Date.now(), { discardOverrun });
  const handleBail = () => (isTooShort() ? setShowDiscardDialog(true) : setShowBailDialog(true));
  const handleBailDialogClose = () => setShowBailDialog(false);
  const handleDiscardDialogClose = () => {
    setShowDiscardDialog(false);
    setIsDiscardChosen(false);
  };
  const handleDiscard = () => {
    setIsDiscardChosen(true);
    setShowDiscardDialog(true);
  };
  const handleDone = () =>
    isTooShort() ? setShowDiscardDialog(true) : onDone({ timeLogId: timeLog.id, discardOverrun });
  const handleOverrunToggle = () => setIsOverrunIncluded((isIncluded) => !isIncluded);
  const handleExtend = () => setShowExtendDialog(true);
  const handleExtendDialogClose = () => setShowExtendDialog(false);
  const handlePause = () => setShowPauseDialog(true);
  const handlePauseDialogClose = () => setShowPauseDialog(false);

  if (!routineId && isPending) return null;

  if (!routineId && !task) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error?.message}
      </p>
    );
  }

  return (
    <>
      <SessionCard
        details={
          task ? <TaskDetails isOnTimer task={task} /> : routineId && <RoutineDetails timeLog={timeLog} />
        }
      >
        <header className="flex items-start justify-between gap-4">
          <div className="grid gap-1">
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {isOnBreak ? "Paused" : "Focusing on"}
            </p>
            <h1 className="text-2xl font-semibold wrap-anywhere">{task?.title ?? timeLog.routineTitle}</h1>
          </div>
          <AmbiencePicker />
        </header>
        <Clock
          currentTime={currentTime}
          isOverrunIncluded={isOverrunIncluded}
          timeLog={timeLog}
          onOverrunToggle={handleOverrunToggle}
        />
        {currentBreak && <BreakBanner currentBreak={currentBreak} timeLogId={timeLog.id} />}
        {completionError && (
          <p className="text-sm text-destructive" role="alert">
            {completionError}
          </p>
        )}
        <div className={cn("grid gap-2", ACTION_GRID_CLASSES.at(actionCount - 1))}>
          {canExtend && (
            <Button
              disabled={isOnBreak || extensionMinutesLeft <= 0}
              size="lg"
              type="button"
              variant="outline"
              onClick={handleExtend}
            >
              <Plus />
              Extend
            </Button>
          )}
          {!hasOverrun && (
            <Button disabled={isOnBreak} size="lg" type="button" variant="outline" onClick={handlePause}>
              <Pause />
              Pause
            </Button>
          )}
          {canBail ? (
            <Button size="lg" type="button" variant="outline" onClick={handleBail}>
              <LogOut />
              Bail
            </Button>
          ) : (
            <Button size="lg" type="button" variant="outline" onClick={handleDiscard}>
              <X />
              Discard
            </Button>
          )}
          <Button
            className="bg-muted text-primary"
            disabled={isCompleting}
            size="lg"
            type="button"
            variant="ghost"
            onClick={handleDone}
          >
            <PartyPopper />
            Done
          </Button>
        </div>
      </SessionCard>
      {showExtendDialog && (
        <ExtendDialog
          minutesLeft={extensionMinutesLeft}
          timeLogId={timeLog.id}
          onClose={handleExtendDialogClose}
        />
      )}
      {showPauseDialog && <PauseDialog timeLogId={timeLog.id} onClose={handlePauseDialogClose} />}
      {showBailDialog && (
        <BailDialog discardOverrun={discardOverrun} timeLogId={timeLog.id} onClose={handleBailDialogClose} />
      )}
      {showDiscardDialog && (
        <DiscardDialog isChosen={isDiscardChosen} timeLogId={timeLog.id} onClose={handleDiscardDialogClose} />
      )}
    </>
  );
};

export default Session;
