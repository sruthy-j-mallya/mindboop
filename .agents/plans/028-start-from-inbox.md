# 028 — Start a task from the Inbox

Status: done
Date: 2026-11-16

## Goal

Start a session on a task straight from its Inbox pane: the Timer page opens with the task picked and the timer preset
to its estimate. If another task is on the clock, ask how to wrap that one up first.

## Decisions

| Area | Choice |
| --- | --- |
| Button | "Start" (`Inbox/TaskPane/StartTaskButton`) in the pane's top-right controls, after delete; not on list rows. With this task already on the clock it reads "On the clock" and just opens the Timer |
| Hand-off | `navigate(routes.timer, { state: { taskId } })` (`TimerLocationState` in `Timer/types.ts`). `Timer/Setup` reads it once into state, fetches the task, and clears the router state (`replace`), so it isn't preselected again when the next session ends or on reload. No new endpoint |
| Estimate | Whenever the picked task loads (from the Inbox or the search), an estimate of 1–240 minutes switches to Timer mode and presets the minutes; longer or no estimate keeps the current setup (5 minutes by default). Done while rendering, keyed on the task id, so later edits to the minutes stick |
| Switching | `Inbox/TaskPane/SwitchSessionDialog`: shows the running session (task title, mode, a ticking "12:30 left" / "04:10 elapsed", or "paused" on a break) with **Bail out** (opens the breadcrumbs dialog), **Mark as done** (`POST …/completion`, which also completes that task) and **Cancel**. Once the session ends, it navigates to the Timer with the new task |
| Too short to log | Under `DISCARD_BELOW_MINUTES` (decided when the dialog opens) bail-out and done would be rejected, so the dialog offers only **Discard and switch** (`DELETE /api/time_logs/:id`) |
| Mounting | The dialog keeps the time log it opened with (`switchingFrom` state), not the live query: ending the session refetches the current time log as null, and the dialog has to stay mounted for its `mutate` `onSuccess` to navigate |
| Shared code | Promoted since the Inbox now uses them: `Timer/BailDialog` → `components/commons/BailDialog` (new `onBailedOut`, defaulting to `onClose`), `Timer/utils.ts` → `utils/timeLogs.ts`, `DISCARD_BELOW_MINUTES` → `constants/index.ts`. `renderWithProviders` accepts a location object, to start with router state |
