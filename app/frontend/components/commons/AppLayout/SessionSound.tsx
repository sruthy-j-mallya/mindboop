import type { TimeLog } from "@/apis/types";
import Ambience from "@/components/commons/Ambience";
import useStartingSound from "@/components/commons/Ambience/useStartingSound";

type SessionSoundProps = { timeLog: TimeLog };

// The session's background sound: the one picked, or its routine's or task's area's as the session starts.
const SessionSound = ({ timeLog }: SessionSoundProps) => {
  useStartingSound(timeLog);

  return <Ambience timeLog={timeLog} />;
};

export default SessionSound;
