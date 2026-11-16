import type { ReactNode } from "react";

type DialProps = { progress?: number; children: ReactNode };

// The ring around the clock face. `progress` (0–1) is how much of it is filled. Without it (a stopwatch, which has
// no end) there's no arc at all: even at 0 its round cap would draw a dot at the top.
const Dial = ({ progress, children }: DialProps) => (
  <div className="relative mx-auto aspect-square w-full max-w-xs">
    <svg aria-hidden="true" className="size-full -rotate-90 fill-none" viewBox="0 0 100 100">
      <circle className="stroke-secondary/40" cx="50" cy="50" r="49.5" strokeWidth="0.5" />
      <circle className="stroke-border" cx="50" cy="50" r="46" strokeWidth="2.5" />
      {progress !== undefined && (
        <circle
          className="stroke-primary transition-[stroke-dasharray] duration-1000 ease-linear"
          cx="50"
          cy="50"
          pathLength={1}
          r="46"
          strokeDasharray={`${progress} 1`}
          strokeLinecap="round"
          strokeWidth="2.5"
        />
      )}
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">{children}</div>
  </div>
);

export default Dial;
