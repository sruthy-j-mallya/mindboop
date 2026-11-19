import type { TimeLog } from "@/apis/types";
import Ambience from "@/components/commons/Ambience";
import useLifeAreaSound from "@/components/commons/Ambience/useLifeAreaSound";

type SessionSoundProps = { timeLog: TimeLog };

// The session's background sound: the one picked, or its task's area's as the session starts.
const SessionSound = ({ timeLog }: SessionSoundProps) => {
  useLifeAreaSound(timeLog);

  return <Ambience timeLog={timeLog} />;
};

export default SessionSound;
