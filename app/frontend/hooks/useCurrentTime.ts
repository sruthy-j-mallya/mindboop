import { useEffect, useState } from "react";

const TICK_INTERVAL = 1000; // 1 second

// `tickInterval` (ms) is how often the time refreshes while ticking.
const useCurrentTime = (isTicking: boolean, tickInterval = TICK_INTERVAL) => {
  const [currentTime, setCurrentTime] = useState(Date.now);

  useEffect(() => {
    if (!isTicking) return undefined;

    const interval = setInterval(() => setCurrentTime(Date.now()), tickInterval);

    return () => clearInterval(interval);
  }, [isTicking, tickInterval]);

  return currentTime;
};

export default useCurrentTime;
