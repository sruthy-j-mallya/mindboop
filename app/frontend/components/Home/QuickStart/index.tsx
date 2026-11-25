import { Timer } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrentTimeLog } from "@/hooks/reactQuery/useCurrentTimeLogsApi";
import { useCreateQuickStart } from "@/hooks/reactQuery/useQuickStartsApi";
import routes from "@/routes";

import type { QuickStartFormValues } from "./constants";
import QuickStartForm from "./QuickStartForm";
import { buildQuickStartPayload, clearDraft } from "./utils";

// Starts a task and its timer in one go. One thing at a time: with a session already running it leads to that instead,
// and what was written waits in the saved draft.
const QuickStart = () => {
  const navigate = useNavigate();
  const { data: timeLog } = useCurrentTimeLog();
  // Lives here and not in the form: the new session becomes the current one before the success callback runs, and
  // the callback is lost if the form has unmounted by then.
  const { mutate: createQuickStart, isPending: isBeginning, error } = useCreateQuickStart();
  const isSessionRunning = !!timeLog && !isBeginning;

  const handleSessionStarted = () => {
    clearDraft();
    navigate(routes.timer);
  };

  const handleBegin = (values: QuickStartFormValues) =>
    createQuickStart(buildQuickStartPayload(values), { onSuccess: handleSessionStarted });

  return (
    <section aria-labelledby="quick-start-heading" className="grid min-w-0">
      <Card>
        <CardContent className="flex flex-1 flex-col gap-4">
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Start with intention
          </p>
          <h2 id="quick-start-heading" className={isSessionRunning ? "text-lg font-semibold" : "sr-only"}>
            {isSessionRunning ? "A session is on the clock" : "What do you want to get done?"}
          </h2>
          {isSessionRunning ? (
            <>
              <p className="text-sm text-muted-foreground">
                One thing at a time. Wrap it up to start another.
              </p>
              <Button asChild className="mt-auto h-12 w-full text-base">
                <Link to={routes.timer}>
                  <Timer />
                  Return to timer
                </Link>
              </Button>
            </>
          ) : (
            <QuickStartForm error={error?.message} isBeginning={isBeginning} onBegin={handleBegin} />
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default QuickStart;
