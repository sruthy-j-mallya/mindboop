# 020 — Inbox

Status: done
Date: 2026-11-14

## Goal

An Inbox page, reached from the sidebar, for collecting tasks. Add a task by its title, see every task still to do, and
open one to see and change its steps and description in a pane on the right.

## Decisions

| Area | Choice |
| --- | --- |
| What the Inbox is | Every incomplete task the user has (tasks from Quick Start included), oldest first. No new model or column |
| API | `GET /api/tasks` takes an optional `is_completed` filter (`filter_by_completion`, which returns early when it's blank). The Inbox sends `is_completed=false` |
| Routes | `routes.inbox.index` (`/inbox`) renders `Inbox` with the list; `routes.inbox.show` (`/inbox/:taskId`) is a nested route rendering `Inbox/TaskPane` in its `<Outlet />`, so the picked task is in the URL and survives a reload. The index route shows `NoTaskSelected` |
| Layout | Two columns from `lg`: list on the left, pane (a sticky card) on the right. Below `lg` only one shows: the list, or the pane with a back link once a task is picked |
| Sidebar | "Inbox" (`Inbox` icon) between Quick start and Timer, active on any `/inbox` path |
| Adding | `Inbox/AddTaskForm` (RHF + Zod, title only). The input clears as soon as the task is sent and the button is never disabled, so tasks can be typed one after another (a disabled default button would block Enter). A failed task's title comes back if the input is still empty, with the error in `role="alert"` |
| Listing | `useInfiniteTasks(filters)` (`useInfiniteQuery`, key `QUERY_KEYS.TASKS.INFINITE_LIST`, under `LISTS` so task and step mutations refresh it). "Load more" fetches the next page of 20 |
| Completing | Each row has a "Complete <title>" checkbox, which sets `is_completed`. It stays ticked until the refreshed list drops the task. Completing the open task returns to `/inbox` |
| Empty state | "Your Inbox is empty" with a hint to add a task |
| Pane | `Inbox/TaskPane/Details` (keyed by task id) shows the title, the steps (`commons/TaskSteps`, moved from `Timer/Steps` now that two features use it) and `commons/TaskDescription`, each saving on its own as on the Timer |
