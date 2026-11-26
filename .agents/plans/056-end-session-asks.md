# 056 — End session, then ask whether the task is finished

Status: done
Date: 2026-11-26

## Goal

On the Timer, Done ended the session and finished the task. At the end of a good session it read as "I'm done
focusing", so it got pressed with the task still open, where Bail was the right button. Ending a session and finishing
its task are two questions; the Timer now asks them one after the other. Follows 051 item 18.

## Decisions

- **One primary button**: the action row is Extend, Pause and **End session** (primary). Bail and Done are gone from it.
  A routine's session keeps its quiet Discard beside End session.
- **The question comes after**: End session on a task opens `Timer/EndSessionDialog`: "Is the task finished?", with
  **Not yet** (leave breadcrumbs) and **Yes, it's finished** (mark it done). Closing it returns to the session.
  - Not yet swaps to the existing `BailDialog` (the same swap `SwitchSessionDialog` does), so the breadcrumbs form and
    its bail-out request don't change.
  - Yes runs the existing completion (`onDone`), so the chime and FinishedDialog don't change.
- **Routines**: no task to ask about, so End session completes the session straight away, as Done did.
- **Too short to log**: End session opens DiscardDialog as Done did, with "Mark task done, don't log time" for a task.
  Bailing out early used to hide that button; the one End session path now always offers it.
- **Overrun**: whether the extra time is logged is read when End session is pressed and passed to either ending.
- **FinishedDialog** pauses its fade on pointer move, not enter: it opens under the pointer that just pressed "Yes,
  it's finished", which isn't a hover, and it never faded.
- **Out of scope**: `SwitchSessionDialog` keeps Bail out / Mark as done, since switching already asks deliberately. The
  dialog doesn't open on its own when a timer reaches zero.

## Work

- [x] `Timer/EndSessionDialog/index.tsx`, wired into `Timer/Session.tsx`; grid comment in `Timer/constants.ts`
- [x] Vitest: `Timer/index.test.tsx` (button names, the new dialog, routine and too-short paths)
- [x] Playwright: `e2e/timer.spec.ts`, `e2e/routines.spec.ts`, `e2e/quick_start.spec.ts`
