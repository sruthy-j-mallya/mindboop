import { useState } from "react";

import { LogOut, PartyPopper, Pause, Plus } from "lucide-react";

import type { TimeLog } from "@/apis/types";
import BreakBanner from "@/components/commons/BreakBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useTask } from "@/hooks/reactQuery/useTasksApi";

import Ambience from "./Ambience";
import BailDialog from "./BailDialog";
import Countdown from "./Countdown";
import DiscardDialog from "./DiscardDialog";
import ExtendDialog from "./ExtendDialog";
import { MAX_EXTENSION_MINUTES } from "./ExtendDialog/constants";
import PauseDialog from "./PauseDialog";
import { isTooShortToKeep } from "./utils";

type SessionProps = {
  timeLog: TimeLog;
  isCompleting: boolean;
  completionError?: string;
  onDone: (timeLogId: string) => void;
};

const Session = ({ timeLog, isCompleting, completionError, onDone }: SessionProps) => {
  const { data: task, isPending, error } = useTask(timeLog.taskId);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [showBailDialog, setShowBailDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const { currentBreak } = timeLog;
  const isOnBreak = !!currentBreak;
  const extensionMinutesLeft = MAX_EXTENSION_MINUTES - timeLog.bufferMinutes;

  // Decided on the click, so the open dialog doesn't change when the elapsed time crosses the limit.
  const handleBail = () =>
    isTooShortToKeep(timeLog, Date.now()) ? setShowDiscardDialog(true) : setShowBailDialog(true);
  const handleBailDialogClose = () => setShowBailDialog(false);
  const handleDiscardDialogClose = () => setShowDiscardDialog(false);
  const handleDone = () => onDone(timeLog.id);
  const handleExtend = () => setShowExtendDialog(true);
  const handleExtendDialogClose = () => setShowExtendDialog(false);
  const handlePause = () => setShowPauseDialog(true);
  const handlePauseDialogClose = () => setShowPauseDialog(false);

  if (isPending) return null;

  if (!task) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error?.message}
      </p>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-8">
        <header className="flex items-start justify-between gap-4">
          <div className="grid gap-1">
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {isOnBreak ? "Paused" : "Focusing on"}
            </p>
            <h1 className="text-2xl font-semibold wrap-anywhere">{task.title}</h1>
          </div>
          <Ambience timeLog={timeLog} />
        </header>
        <Countdown timeLog={timeLog} />
        {currentBreak && <BreakBanner currentBreak={currentBreak} timeLogId={timeLog.id} />}
        {task.checklistItems.length > 0 && (
          // Checklist items can't be changed through the API yet, so these only show the saved state.
          <ul aria-label="Steps" className="flex flex-col gap-4">
            {task.checklistItems.map(({ id, title, isCompleted }) => (
              <li key={id} className="flex items-center gap-3">
                <Checkbox
                  disabled
                  checked={isCompleted}
                  className="size-6 border-2 border-primary/40 disabled:opacity-100"
                  id={id}
                />
                <Label
                  className="text-base font-normal wrap-anywhere peer-disabled:cursor-default peer-disabled:opacity-100"
                  htmlFor={id}
                >
                  {title}
                </Label>
              </li>
            ))}
          </ul>
        )}
        <Separator />
        {completionError && (
          <p className="text-sm text-destructive" role="alert">
            {completionError}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2">
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
          <Button disabled={isOnBreak} size="lg" type="button" variant="outline" onClick={handlePause}>
            <Pause />
            Pause
          </Button>
          <Button size="lg" type="button" variant="outline" onClick={handleBail}>
            <LogOut />
            Bail
          </Button>
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
      </CardContent>
      {showExtendDialog && (
        <ExtendDialog
          minutesLeft={extensionMinutesLeft}
          timeLogId={timeLog.id}
          onClose={handleExtendDialogClose}
        />
      )}
      {showPauseDialog && <PauseDialog timeLogId={timeLog.id} onClose={handlePauseDialogClose} />}
      {showBailDialog && <BailDialog timeLogId={timeLog.id} onClose={handleBailDialogClose} />}
      {showDiscardDialog && <DiscardDialog timeLogId={timeLog.id} onClose={handleDiscardDialogClose} />}
    </Card>
  );
};

export default Session;
