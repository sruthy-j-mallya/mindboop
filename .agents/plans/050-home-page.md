# 050 — Home page

Status: proposed
Date: 2026-11-25
Mockup: https://claude.ai/artifact/FiQcbrzUah9G9wEagfhHZf (private)

## Goal

Replace the Quick Start page with a Home page that shows what matters now, in four quarters: Quick start, Today's
agenda, Pick up where you left off, and Overdue.

## Decisions

| Area | Choice |
| --- | --- |
| Navigation | Home (`House` icon) takes Quick start's place in the sidebar, and `/` renders it. Sign-in and sign-up redirects don't change. The standalone Quick Start page is removed |
| Layout | Two by two on wide screens, in the order Quick start, Today's agenda, Pick up where you left off, Overdue. One column in that order on narrow screens. Under a heading with today's date and a short count ("4 on today's agenda, 4 overdue") |
| Quick start | The existing form, draft storage, validation and `POST /api/quick_starts`, in a card. "Add notes" shows the description editor (open from the start when the draft has one); steps, estimate presets, custom minutes and Begin stay. With a session running, the card shows "Return to timer" instead, since a second session can't start; the draft is kept |
| Today's agenda | Open tasks whose date is today or whose duration touches today. All-day first, then by start time. A task timed earlier today stays here, in red through `ScheduleLabel`. The heading links to the Calendar. Routines aren't shown |
| Overdue | Open tasks that ended (or were due) before today, oldest first. "Move to today" makes the task an all-day date for today, dropping any time or duration it had |
| No repeats | A task is in the agenda or in Overdue, never both. It can also be in Pick up where you left off, which answers a different question |
| Pick up where you left off | Open tasks with at least one breadcrumb, latest breadcrumb first: the title, the latest "Pick up from" and its time. They stay until completed or deleted, however old |
| Resume | Opens the Timer with the task picked; the clock starts on Start there. Same behaviour as the task pane's Start: another session on the clock opens `SwitchSessionDialog`, and the task already on the clock just leads to the Timer |
| Rows | A checkbox completes the task (with the usual chime); the title opens it in its area or the Inbox. Overdue rows show the due date |
| Long lists | Five rows, then "Show all N", which expands the card in place |
| Empty states | Agenda: "Nothing is due or scheduled today." Pick up: "When you bail out of a session, the note you leave yourself shows up here." Overdue: "Nothing overdue." |
| Loading and errors | Quick start shows at once. The other three share one request, and show its error in a `role="alert"` |
| Day boundary | The browser sends the start of its day and of the next one, as the server has no user time zone. The range follows the clock, so Home moves on at midnight |
| Out of scope | Reordering or hiding quarters, snoozing, bulk "move all to today", routines, stats |

## Backend

- `GET /api/home_tasks?from&to` (`Api::HomeTasksController#index`), unpaged, returning `{ today, overdue, resumable }`,
  each a list of tasks in the existing shape. It replaces the `/api/home` named earlier: an `index` fits the standard
  actions and `verify_policy_scoped`. Missing, malformed or reversed times, or a range over 25 hours (the longest day,
  when clocks go back), get a 422.
- Every list starts from `policy_scope(Task).kept.where(is_completed: false)`. New `Task` scopes:
  - `due_between(from, to)`: `starts_at < to` and `COALESCE(ends_at, starts_at) >= from`. `scheduled_between` doesn't
    fit, as it stretches a date by a day for the Calendar.
  - `overdue_at(from)`: `COALESCE(ends_at, starts_at) < from`. Together with `due_between` it never repeats a task.
  - `by_latest_breadcrumb`: tasks with breadcrumbs, by their newest one.
- Preloads `checklist_items` and `breadcrumbs`. No migration.
- `docs/api.md` documents the endpoint and drops the mention of the Quick Start page.

## Frontend

- `apis/home_tasks.ts`, types in `apis/types.ts`, and `hooks/reactQuery/useHomeTasksApi.ts` (`useHomeTasks`), keeping the
  previous day's lists on screen while the next load.
- `QUERY_KEYS.TASKS.HOME` sits under `TASKS.LISTS`, so whatever refreshes the task lists refreshes Home. Bailing out
  doesn't refresh those today, so `useBailOutTimeLog` also invalidates `TASKS.LISTS`.
- `components/Home/`: `index.tsx`, `Today.tsx`, `Overdue.tsx`, `Resumable.tsx`, `TaskRow.tsx`, `constants.ts`,
  `utils.ts`, `types.ts`. `components/QuickStart/` moves to `components/Home/QuickStart/`.
- The Start logic in `StartTaskButton` moves to a hook, `useStartTask`, so Resume shares it. `SwitchSessionDialog` moves
  to `components/commons/SwitchSessionDialog`, as two features now use it.
- All colours come from the semantic tokens, so Home works in dark mode and with the colour themes.

## Tests

- **Rails:** `home_tasks_controller_test` covers each list, the day boundaries (an all-day date today, a multi-day
  duration, a time earlier today, yesterday), completed and deleted tasks left out, invalid ranges and signed-out access.
  Another user's tasks are left out, which stands in for a Pundit denial as no single record is loaded. Model tests cover
  the scopes.
- **Vitest:** Home (lists, empty states, Show all, completing, Move to today, Resume with and without a running session,
  error), the Quick start card with a session running, the sidebar, and the bail-out invalidation.
- **Playwright:** new `home.spec.ts`. Update `quick_start.spec.ts` for "Add notes", and `timer.spec.ts` and
  `settings.spec.ts`, which click the "Quick start" link.

## Order of work

1. Scopes, endpoint, Rails tests and API docs.
2. API module, query hook, cache keys and bail-out refresh.
3. Home with the three lists, and the Resume hook.
4. Move Quick start into Home; sidebar and route.
5. Vitest and Playwright, then the full check from `CLAUDE.md`.

## Other branches

- `have-theme-options` isn't merged. It takes plan number 049, so this is 050.
- `design-updates` isn't merged either, and changes `QuickStart/index.tsx` and `QuickStart/Estimate.tsx`, which this plan
  moves. Whichever merges second needs a rebase there.
