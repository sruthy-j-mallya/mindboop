import { useState } from "react";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOnboarding } from "@/hooks/reactQuery/useOnboardingsApi";
import { useCurrentUser } from "@/hooks/reactQuery/useSessionsApi";
import { readStorage, writeStorage } from "@/utils/storage";

import { DISMISSED_STORAGE_KEY, STEPS } from "./constants";
import Step from "./Step";

// A new account's first steps, until they're all taken or it's dismissed.
const Onboarding = () => {
  const { data: user } = useCurrentUser();
  const [isDismissed, setIsDismissed] = useState(false);
  const storageKey = `${DISMISSED_STORAGE_KEY}.${user?.id}`;
  const isHidden = !user || isDismissed || readStorage(storageKey) === "true";
  const { data: onboarding } = useOnboarding({ enabled: !isHidden });

  const handleDismiss = () => {
    setIsDismissed(true);
    writeStorage(storageKey, "true");
  };

  if (isHidden || !onboarding || STEPS.every(({ getIsDone }) => getIsDone(onboarding))) return null;

  return (
    <section aria-labelledby="onboarding-heading">
      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-semibold" id="onboarding-heading">
              Getting started
            </h2>
            <Button
              aria-label="Dismiss getting started"
              className="-mt-1 text-muted-foreground"
              size="icon-sm"
              type="button"
              variant="ghost"
              onClick={handleDismiss}
            >
              <X />
            </Button>
          </div>
          <ol className="grid gap-2 sm:grid-cols-3">
            {STEPS.map(({ getIsDone, ...step }) => (
              <Step key={step.label} {...step} isDone={getIsDone(onboarding)} />
            ))}
          </ol>
        </CardContent>
      </Card>
    </section>
  );
};

export default Onboarding;
