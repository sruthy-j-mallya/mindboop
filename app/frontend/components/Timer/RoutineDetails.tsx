import RoutineBadge from "@/components/commons/Routine/Badge";
import { useRoutines } from "@/hooks/reactQuery/useRoutinesApi";

type RoutineDetailsProps = { routineId: string };

// Beside a routine's clock: its icon and a reminder that any time counts. A routine deleted mid-session just shows the
// words.
const RoutineDetails = ({ routineId }: RoutineDetailsProps) => {
  const { data: routines } = useRoutines();
  const routine = routines?.find(({ id }) => id === routineId);

  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center lg:my-auto">
      {routine && (
        <RoutineBadge className="size-20" color={routine.color} icon={routine.icon} iconClassName="size-10" />
      )}
      <p className="max-w-xs text-muted-foreground">
        Any time you give this counts. Press Done whenever you’re done, even if the clock isn’t.
      </p>
    </div>
  );
};

export default RoutineDetails;
