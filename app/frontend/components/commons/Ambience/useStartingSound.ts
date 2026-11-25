import { useEffect } from "react";

import type { TimeLog } from "@/apis/types";
import { useLifeAreas } from "@/hooks/reactQuery/useLifeAreasApi";
import { useRoutines } from "@/hooks/reactQuery/useRoutinesApi";
import useAmbienceStore from "@/stores/useAmbienceStore";

// A session on a routine starts with the routine's background sound, and one on a task in an area of life with the
// area's, silence included. It switches once per session (the store remembers which), so a sound picked during the
// session stays, even across reloads.
const useStartingSound = ({
  id,
  lifeAreaId,
  routineId,
}: Pick<TimeLog, "id" | "lifeAreaId" | "routineId">) => {
  const applyStartingSound = useAmbienceStore((state) => state.applyStartingSound);
  const { data: lifeAreas } = useLifeAreas({ enabled: !!lifeAreaId });
  const { data: routines } = useRoutines({ enabled: !!routineId });
  const startingSound = routineId
    ? routines?.find((routine) => routine.id === routineId)?.sound
    : lifeAreas?.find((lifeArea) => lifeArea.id === lifeAreaId)?.defaultSound;

  useEffect(() => {
    if (startingSound) applyStartingSound(id, startingSound);
  }, [id, startingSound, applyStartingSound]);
};

export default useStartingSound;
