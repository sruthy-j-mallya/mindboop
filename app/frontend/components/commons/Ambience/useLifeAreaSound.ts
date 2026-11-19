import { useEffect } from "react";

import type { TimeLog } from "@/apis/types";
import { useLifeAreas } from "@/hooks/reactQuery/useLifeAreasApi";
import useAmbienceStore from "@/stores/useAmbienceStore";

// A session on a task in an area of life starts with the area's background sound, if it has one. It switches once per
// session (the store remembers which), so a sound picked during the session stays, even across reloads.
const useLifeAreaSound = ({ id, lifeAreaId }: Pick<TimeLog, "id" | "lifeAreaId">) => {
  const applyLifeAreaSound = useAmbienceStore((state) => state.applyLifeAreaSound);
  const { data: lifeAreas } = useLifeAreas({ enabled: !!lifeAreaId });
  const lifeAreaSound = lifeAreas?.find((lifeArea) => lifeArea.id === lifeAreaId)?.defaultSound;

  useEffect(() => {
    if (lifeAreaSound) applyLifeAreaSound(id, lifeAreaSound);
  }, [id, lifeAreaSound, applyLifeAreaSound]);
};

export default useLifeAreaSound;
