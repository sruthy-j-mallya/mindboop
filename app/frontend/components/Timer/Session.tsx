import { useState } from "react";

import { LogOut, PartyPopper, Pause, Plus } from "lucide-react";

import type { TimeLog } from "@/apis/types";
import BreakBanner from "@/components/commons/BreakBanner";
import AddStepButton from "@/components/commons/Steps/AddStepButton";
import { NEW_STEP_DRAFT } from "@/components/commons/Steps/constants";
import type { Draft } from "@/components/commons/Steps/types";
import TaskDescription from "@/components/commons/TaskDescription";
import TaskSteps from "@/components/commons/TaskSteps";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const [stepDraft, setStepDraft] = useState<Draft | null>(null);
  const { currentBreak } = timeLog;
  const isOnBreak = !!currentBreak;
  const extensionMinutesLeft = MAX_EXTENSION_MINUTES - timeLog.bufferMinutes;

  // Decided on the click, so the open dialog doesn't change when the elapsed time crosses the limit.
  const handleBail = () =>
    isTooShortToKeep(timeLog, Date.now()) ? setShowDiscardDialog(true) : setShowBailDialog(true);
  const handleBailDialogClose = () => setShowBailDialog(false);
  const handleDiscardDialogClose = () => setShowDiscardDialog(false);
  // A row that's already open keeps its place rather than being replaced.
  const handleAddStep = () => setStepDraft((draft) => draft ?? NEW_STEP_DRAFT);
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
    <Card className="mx-auto w-full max-w-2xl lg:max-w-5xl">
      <CardContent className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* The timer and its actions stay together (and pinned on wide screens), so a long description never
            pushes the buttons out of view. */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-4 lg:self-start">
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
          {completionError && (
            <p className="text-sm text-destructive" role="alert">
              {completionError}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
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
        </div>
        {/* Steps and the description can be changed mid-session; each change saves on its own. */}
        <div className="flex flex-col gap-8 border-t pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
          {/* The add button only starts the first step, which opens right below it; after that, Enter in a step adds
              the next one. It stays while that first row is open, so the row doesn't jump up under the cursor. */}
          <div className="flex flex-col gap-2">
            {task.checklistItems.length === 0 && (
              <div className="flex justify-end">
                <AddStepButton onClick={handleAddStep} />
              </div>
            )}
            <TaskSteps draft={stepDraft} task={task} onDraftChange={setStepDraft} />
          </div>
          <TaskDescription key={task.id} task={task} />
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
