# 026 — Parking lot review: curiosity time, schedule on convert, gentler wording

Status: done (Now section); TODO section open
Date: 2026-11-15

## Goal

Make reviewing the Parking lot safe for ADHD/autistic users: a quick look-up gets a short timebox with a reminder
instead of becoming a rabbit hole, a thought that needs real time gets a slot right away, and the page reads calmer
(no kinds, no colour blocks, "Let it go" instead of "Discard"). Follows the UX review of plan 025.

## Now

### 1. Curiosity time (a timeboxed look-up with a reminder)

| Area | Choice |
| --- | --- |
| Name | "Curiosity time" (the button reads "Look into it · 5 min"). Not "Rabbit hole time": that names what we're avoiding |
| Storage | `parking_lot_items.curiosity_ends_at` (datetime, null) and `is_curiosity_extended` (boolean, default false). Added by editing the branch-only `create_parking_lot_items` migration in place (rolls back and drops dev parking lot rows) |
| Model | `CURIOSITY_MINUTES = 5`. A user has at most one running curiosity time (`curiosity_ends_at` set, item still parked). `start_curiosity_time!` sets it to 5 minutes from now; `extend_curiosity_time!` adds 5 minutes once (from the end, or from now once it's past) and sets `is_curiosity_extended`; `end_curiosity_time!` clears it. Marking addressed, converting or letting go clears it too |
| API | Singular top-level `resource :curiosity_time, only: %i[ show create update destroy ]` (`Api::CuriosityTimesController`). `show` returns the running one (the item, or `null`); `create` takes `parking_lot_item_id`; `update` extends (422 "You've already added more time" the second time); `destroy` ends it. Starting a second one while one runs is 422 "Finish your current curiosity time first". Authorised through `ParkingLotItemPolicy#update?`. Item changes invalidate a shared `QUERY_KEYS.PARKING_LOT_ITEMS.ALL`, so the curiosity time refreshes with the lists |
| Page | Parked rows get "Look into it · 5 min" as their first action. While running, that row reads "Looking into it" with an accent stripe (the countdown lives in the banner), and every Look into it button is disabled |
| Reminder | An app-wide `CuriosityAlarm` in `AppLayout`, built like `ActiveBreakAlarm`: the same phase timers, wake checks, alarm sound and browser notification ("Curiosity time's up" / the thought). The plumbing is shared as `AppLayout/useAlarm.ts`; `getRemainingSeconds` and `formatRemainingTime` moved to `utils/`. The banner shows the thought and a countdown while running, then "Got your answer?" with: **Done, mark addressed** · **Needs real time → Add as task** (opens the schedule popover from 2) · **5 more minutes** (only before the one extension) · **Not now** (ends it, stays parked) |
| Notifications | Ask for notification permission on the Look into it click, as breaks do |

### 2. Schedule while adding as a task

| Area | Choice |
| --- | --- |
| UI | "Add as task" opens a popover with the existing schedule picker (Date / Duration tabs) and two buttons: **Add** (with the chosen schedule) and **Add undated**. Promoted `Inbox/SchedulePicker` to `components/commons/SchedulePicker`; it takes a `schedule` (unscheduled by default), `clearLabel`/`saveLabel` and `side`. Rows open it to the left, where there's room |
| Size | The picker is compact everywhere: 2rem day cells, tight week rows (`CALENDAR_CLASS_NAMES`), `w-72`, small buttons, and it scrolls within the available height when it still can't fit |
| API | `POST /api/parking_lot_items/:id/conversion` takes optional `starts_at`, `ends_at`, `is_duration`, `is_all_day`; `convert_to_task!` passes them to `tasks.create!`, so `Task` validations apply and a bad schedule is 422 |
| Toast | "Added to your Inbox", with Open. Showing the schedule in it is left out for now (`formatSchedule` lives in Inbox) |

### 3. Remove kind, rewrite the tagline

- Drop `kind` from the migration (edited in place, see 1), the model enum, strong params, Jbuilder, `apis/types.ts`, the
  ParkForm chips, `KIND_CLASS_NAMES`, tests, factories and `docs/api.md`.
- The capture form is just the input, with no card around it on the page. Card meta becomes the time alone.
- New tagline on the page and the Timer panel: "Ideas, curiosities, worries, feelings. Whatever pops up, park it here. It'll wait."

### 4. "Let it go" instead of "Discard"

- Button label "Let it go" on every tab, with a soft icon (lucide `Wind`) instead of `Trash2`, and no destructive red
  hover.
- Toast "Let go" with Undo (was "Thought discarded"). The API stays `DELETE` + `restoration`.
- Update the Vitest and e2e queries that look for "Discard".

### 5. Calmer cards

- With kinds gone, cards drop the full-width colour tints: `bg-card` with a border in both themes, the same on the
  page and the Timer panel.
- Meta text uses `text-muted-foreground` on that neutral surface.
- The running curiosity row is the one exception: a thin left accent stripe plus the countdown text, so colour is not
  the only signal.

### Docs and tests

- `docs/api.md`: curiosity time endpoints, conversion schedule params, kind removed.
- Minitest for `CuriosityTimesController` (success, validation failure, unauthenticated, Pundit denial, one-at-a-time,
  one extension) and the conversion schedule params; model tests for the curiosity methods.
- Vitest for the row actions, the schedule popover and `CuriosityAlarm`; Playwright for park → look into it → mark
  addressed, and park → add as task with a date.

## TODO (needs more thinking about user behaviour)

- **Prompting a review.** Nothing brings the user back, and an unreviewed pile turns into a guilt list. Ideas to weigh:
  a prompt when a focus session ends ("You parked 3 thoughts. Review now (2 min) or later?"); a neutral count in the
  sidebar (no red badge); a gentle "Parked 2 weeks ago — still relevant?" on old items. Open questions: how often is
  helpful vs nagging, and should it be opt-in?
- **Group curiosities for review** ("4 curiosities → one 15-minute curiosity session"). With kinds removed there's no
  curiosity tag to group by: decide whether the user picks several rows for one session instead.
- **Record the answer.** An optional one-line note when marking addressed ("He's 42"), for closure and to stop
  re-searching.
- **Remember where it came from.** "Parked during: Write report", by linking the item to the `time_log` it was
  parked in.
- **Review order.** Oldest first suits triage better than newest first; check with users before switching.
- **One-at-a-time review mode** (one thought, a few big choices, then the next), from the same UX review.
