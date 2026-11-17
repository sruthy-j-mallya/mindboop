import type { TimeLog } from "@/apis/types";
import useCurrentTime from "@/hooks/useCurrentTime";
import useAmbienceStore from "@/stores/useAmbienceStore";
import { isTicking } from "@/utils/timeLogs";

import useAmbience from "./useAmbience";

type AmbienceProps = { timeLog: TimeLog };

// Plays the chosen background sound for the session on the clock. Mounted by the app layout, so it keeps playing
// on every page; it plays while the clock runs and stops for breaks, once the time is up, and when the session ends.
const Ambience = ({ timeLog }: AmbienceProps) => {
  const soundId = useAmbienceStore((state) => state.soundId);
  const volume = useAmbienceStore((state) => state.volume);
  const currentTime = useCurrentTime(timeLog.isRunning);
  useAmbience({ soundId, volume, isPlaying: isTicking(timeLog, currentTime) });

  return null;
};

export default Ambience;
