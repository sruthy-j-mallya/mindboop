import { LogOut, PartyPopper, Pause, Plus } from "lucide-react";

import type { TimeLog } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useTask } from "@/hooks/reactQuery/useTasksApi";

import Countdown from "./Countdown";

type SessionProps = { timeLog: TimeLog };

const Session = ({ timeLog }: SessionProps) => {
  const { data: task, isPending, error } = useTask(timeLog.taskId);

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
        <header className="grid gap-1">
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">Focusing on</p>
          <h1 className="text-2xl font-semibold wrap-anywhere">{task.title}</h1>
        </header>
        <Countdown timeLog={timeLog} />
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
        <div className="flex flex-wrap justify-end gap-2">
          <Button size="lg" type="button" variant="outline">
            <Plus />
            Extend
          </Button>
          <Button size="lg" type="button" variant="outline">
            <Pause />
            Pause
          </Button>
          <Button size="lg" type="button" variant="outline">
            <LogOut />
            Bail
          </Button>
          <Button className="bg-muted text-primary" size="lg" type="button" variant="ghost">
            <PartyPopper />
            Done
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Session;
