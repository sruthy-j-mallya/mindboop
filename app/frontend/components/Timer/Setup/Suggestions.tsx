import type { Task } from "@/apis/types";
import { useHomeTasks } from "@/hooks/reactQuery/useHomeTasksApi";
import useCurrentTime from "@/hooks/useCurrentTime";
import { getDayRange } from "@/utils/dateTime";

import { DAY_REFRESH_INTERVAL } from "./constants";
import SuggestionList from "./SuggestionList";

type SuggestionsProps = { onPick: (task: Task) => void };

// What to focus on, before a task is picked: today's tasks, then the ones bailed out of.
const Suggestions = ({ onPick }: SuggestionsProps) => {
  const now = useCurrentTime(true, DAY_REFRESH_INTERVAL);
  const { data: home } = useHomeTasks(getDayRange(now));
  const today = home?.today ?? [];
  const todayIds = today.map(({ id }) => id);
  const resumable = (home?.resumable ?? []).filter(({ id }) => !todayIds.includes(id));

  if (today.length + resumable.length === 0) {
    return (
      <p className="m-auto py-12 text-center text-muted-foreground">
        Pick a task to see its steps and description.
      </p>
    );
  }

  return (
    <div className="grid gap-6">
      <p className="text-muted-foreground">Pick a task to focus on.</p>
      <SuggestionList tasks={today} title="Today" onPick={onPick} />
      <SuggestionList tasks={resumable} title="Pick up where you left off" onPick={onPick} />
    </div>
  );
};

export default Suggestions;
