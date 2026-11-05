import { useEffect, useState } from "react";

const TICK_INTERVAL = 1000; // 1 second

const useCurrentTime = (isTicking: boolean) => {
  const [currentTime, setCurrentTime] = useState(Date.now);

  useEffect(() => {
    if (!isTicking) return undefined;

    const interval = setInterval(() => setCurrentTime(Date.now()), TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [isTicking]);

  return currentTime;
};

export default useCurrentTime;
