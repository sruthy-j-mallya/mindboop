import { type RefObject, useEffect, useEffectEvent, useRef } from "react";

import { INITIAL_WHEEL_GESTURE, OVERLAY_SELECTOR } from "./constants";
import type { CalendarView } from "./types";
import { getPagingDistance, stepWheelGesture, toWheelDelta } from "./utils";

// Pages the calendar (`onStep(1)` forward, `onStep(-1)` back) as it's scrolled sideways, or up and down in the month
// view: one page per swipe, however hard, and a page for each swipe, however quick (see `stepWheelGesture`).
const useWheelPaging = (
  ref: RefObject<HTMLElement | null>,
  view: CalendarView,
  onStep: (step: number) => void,
) => {
  const gesture = useRef(INITIAL_WHEEL_GESTURE);

  const handleWheel = useEffectEvent((event: WheelEvent) => {
    // Ctrl + wheel is a pinch zoom.
    if (event.ctrlKey) return;
    if (event.target instanceof Element && event.target.closest(OVERLAY_SELECTOR)) return;

    // Stops the browser scrolling too. (The history swipe is turned off in calendar.css.)
    if (getPagingDistance(view, toWheelDelta(event)) !== 0) event.preventDefault();

    const { gesture: nextGesture, step } = stepWheelGesture(view, gesture.current, event);
    gesture.current = nextGesture;
    if (step !== 0) onStep(step);
  });

  // A new view starts a new swipe.
  useEffect(() => {
    gesture.current = INITIAL_WHEEL_GESTURE;
  }, [view]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    // React's onWheel is passive, so it can't stop the browser's own scrolling.
    element.addEventListener("wheel", handleWheel, { passive: false });

    return () => element.removeEventListener("wheel", handleWheel);
  }, [ref]);
};

export default useWheelPaging;
