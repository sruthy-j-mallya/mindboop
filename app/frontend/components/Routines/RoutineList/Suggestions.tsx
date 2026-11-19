import { useState } from "react";

import { cn } from "cn";
import { Check } from "lucide-react";
import { toast } from "sonner";

import type { CreateRoutinePayload } from "@/apis/types";
import RoutineBadge from "@/components/commons/Routine/Badge";
import { Button } from "@/components/ui/button";
import { useCreateRoutine } from "@/hooks/reactQuery/useRoutinesApi";

import { ROUTINE_SUGGESTIONS } from "../constants";
import { describeAddButton } from "../utils";

// Ideas to start from: pick any number, then add them all at once (each can be changed later). They're added one after
// another, in the order shown, so the list keeps that order. Any that fail stay picked, to try again.
const Suggestions = () => {
  const [pickedTitles, setPickedTitles] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const { mutateAsync: createRoutine } = useCreateRoutine();

  const handleToggle = (title: string) =>
    setPickedTitles((titles) =>
      titles.includes(title) ? titles.filter((picked) => picked !== title) : [...titles, title],
    );

  const handleAdd = async () => {
    const picked = ROUTINE_SUGGESTIONS.filter(({ title }) => pickedTitles.includes(title));
    const failed: CreateRoutinePayload[] = [];
    let lastError = "";
    setIsAdding(true);

    for (const suggestion of picked) {
      try {
        await createRoutine(suggestion);
      } catch (error) {
        failed.push(suggestion);
        lastError = error instanceof Error ? error.message : String(error);
      }
    }

    setIsAdding(false);
    setPickedTitles(failed.map(({ title }) => title));
    if (failed.length > 0)
      toast.error(`Couldn’t add ${failed.map(({ title }) => title).join(", ")}. ${lastError}`);
  };

  return (
    <section aria-labelledby="routine-suggestions" className="grid gap-3 px-2">
      <div className="grid gap-1">
        <h2 className="font-medium" id="routine-suggestions">
          Ideas to start with
        </h2>
        <p className="text-sm text-muted-foreground">
          Little things that still take effort. Pick any, add them in one go, and change them whenever you
          like.
        </p>
      </div>
      <ul aria-label="Ideas" className="flex flex-wrap gap-2">
        {ROUTINE_SUGGESTIONS.map(({ title, color, icon, durationMinutes }) => {
          const isPicked = pickedTitles.includes(title);

          return (
            <li key={title}>
              <button
                aria-pressed={isPicked}
                className={cn(
                  "flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-sm transition-colors outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50",
                  isPicked && "border-primary bg-primary/10 hover:bg-primary/15",
                )}
                disabled={isAdding}
                type="button"
                onClick={() => handleToggle(title)}
              >
                {isPicked ? (
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-4" />
                  </span>
                ) : (
                  <RoutineBadge className="size-7" color={color} icon={icon} iconClassName="size-3.5" />
                )}
                {title}
                <span className="text-muted-foreground">{durationMinutes} min</span>
              </button>
            </li>
          );
        })}
      </ul>
      <Button
        className="w-fit"
        disabled={pickedTitles.length === 0 || isAdding}
        type="button"
        onClick={handleAdd}
      >
        {describeAddButton(pickedTitles.length, isAdding)}
      </Button>
    </section>
  );
};

export default Suggestions;
