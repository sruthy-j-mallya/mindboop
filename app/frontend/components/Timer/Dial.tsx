import type { ReactNode } from "react";

type DialProps = { fill?: number; children: ReactNode };

// The ring around the clock face. `fill` (0–1) is how much of it is drawn, clockwise from the top, so a shrinking fill
// winds back counter-clockwise. With no fill (a stopwatch, which has no end) or none left (a timer at zero) there's
// no arc at all: even at 0 its round cap would draw a dot at the top.
const Dial = ({ fill = 0, children }: DialProps) => (
  <div className="relative mx-auto aspect-square w-full max-w-xs">
    <svg aria-hidden="true" className="size-full -rotate-90 fill-none" viewBox="0 0 100 100">
      <circle className="stroke-secondary/40" cx="50" cy="50" r="49.5" strokeWidth="0.5" />
      <circle className="stroke-border" cx="50" cy="50" r="46" strokeWidth="2.5" />
      {fill > 0 && (
        <circle
          className="stroke-timer-ring transition-[stroke-dasharray] duration-1000 ease-linear"
          cx="50"
          cy="50"
          pathLength={1}
          r="46"
          strokeDasharray={`${fill} 1`}
          strokeLinecap="round"
          strokeWidth="2.5"
        />
      )}
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">{children}</div>
  </div>
);

export default Dial;
