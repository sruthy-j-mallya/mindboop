import { useState } from "react";

import { Play } from "lucide-react";

import type { Task, TimeLogMode } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTask } from "@/hooks/reactQuery/useTasksApi";
import { useCreateTimeLog } from "@/hooks/reactQuery/useTimeLogsApi";

import Dial from "../Dial";
import SessionCard from "../SessionCard";
import TaskDetails from "../TaskDetails";
import { DEFAULT_MODE, DEFAULT_TIMER_MINUTES, MODES } from "./constants";
import MinutesInput from "./MinutesInput";
import TaskSearch from "./TaskSearch";
import { buildTimeLogPayload, findMode } from "./utils";

// Shown when nothing is on the clock: pick a task and a mode, then start. Once the time log is created it becomes
// the current one, and the Timer page swaps this for the running session.
const Setup = () => {
  const [pickedTask, setPickedTask] = useState<Task>();
  const taskId = pickedTask?.id;
  const [mode, setMode] = useState<TimeLogMode>(DEFAULT_MODE);
  const [timerMinutes, setTimerMinutes] = useState(DEFAULT_TIMER_MINUTES);
  const { data: task, error: taskError } = useTask(taskId ?? "", { enabled: !!taskId });
  const { mutate: createTimeLog, isPending: isStarting, error } = useCreateTimeLog();

  const handleModeChange = (value: string) => setMode(findMode(value) ?? DEFAULT_MODE);

  const handleStart = () => {
    if (taskId) createTimeLog(buildTimeLogPayload({ taskId, mode, timerMinutes }));
  };

  const details = task ? (
    <TaskDetails key={task.id} task={task} />
  ) : (
    <p className="m-auto py-12 text-center text-muted-foreground">
      Pick a task to see its steps and description.
    </p>
  );

  return (
    <SessionCard details={details}>
      <header className="grid gap-2">
        <h1 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          Start a session
        </h1>
        <TaskSearch value={pickedTask} onChange={setPickedTask} />
        {taskError && (
          <p className="text-sm text-destructive" role="alert">
            {taskError.message}
          </p>
        )}
      </header>
      <Tabs className="items-center gap-6" value={mode} onValueChange={handleModeChange}>
        <TabsList aria-label="Mode">
          {MODES.map(({ value, label }) => (
            <TabsTrigger key={value} className="px-4" value={value}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent className="w-full" value="stopwatch">
          <Dial>
            <p className="text-6xl font-medium tabular-nums">00:00</p>
            <p className="text-muted-foreground">counts up</p>
          </Dial>
        </TabsContent>
        <TabsContent className="w-full" value="timer">
          <Dial progress={0}>
            <MinutesInput minutes={timerMinutes} onChange={setTimerMinutes} />
            <p className="text-muted-foreground">minutes</p>
          </Dial>
        </TabsContent>
      </Tabs>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
      <Button
        className="h-12 w-full text-base"
        disabled={!taskId || isStarting}
        type="button"
        onClick={handleStart}
      >
        <Play />
        Start
      </Button>
    </SessionCard>
  );
};

export default Setup;
