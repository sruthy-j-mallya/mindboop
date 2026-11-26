# 051 — UI/UX improvements

Status: done (16 dropped)
Date: 2026-11-25

## Goal

Work through the findings of a UI/UX audit of every page: light and dark at desktop width, light at 390px, plus an empty
account, a running session and the main dialogs. The break alarm, curiosity banner, reminders, and the extend and bail
flows weren't tried live. One commit per issue on the `ui-ux-improvements` branch.

## Order of work

1. Quick fixes: 1, 4, 5, 12, 14, 18, 19, 29
2. Trust: 2, 3, 15
3. Visibility: 28, 30–33
4. Mobile: 6, 8, 22, 24, 26, 34
5. Larger work: 13, 20, 23, 27, 49, each with its own plan where it needs decisions
6. The rest, by priority

Tick an issue in the commit that fixes it.

## P0: Broken or blocking

- [x] 1. Search: rows run past the panel, cutting off area names. Let the panel shrink inside the dialog's grid
- [x] 2. Completing a task has no undo, and completed tasks can't be found. Add an Undo toast and a collapsed "Completed"
  section in each list
- [x] 3. Done under 2 minutes only offers to discard, leaving the task open. Add a way to finish the task without logging
- [x] 4. Quick start: 6–9, 11–14 and 16–19 minutes can't be entered. Allow any whole number from 2 to 240
- [x] 5. Unknown URLs show a blank page. Add a not-found page
- [x] 6. Calendar's week view is unreadable on phones. Default to Day or 3 days there, and shorten headers

## P1: High impact

- [x] 7. Start the sidebar expanded on desktop
- [x] 8. Add a bottom bar on phones: Home, Calendar, Routines, Parking lot (with its count), More. Tasks and Timer
  moved under More: Home lists today's tasks and starts sessions, and the mini timer leads back to the timer. No
  quick-add button on phones: stray thoughts go to the Parking lot, to be dated later, instead of getting lost in the
  Inbox
- [x] 9. Rename the "Areas of life" link "Tasks", as it opens the Inbox
- [x] 10. Move Sign out into an account section in Settings
- [x] 11. ⌘K opens search (the editor keeps it for links), plus a quick capture shortcut
- [x] 12. Name the page in the browser tab, with the time left during a session
- [x] 13. Agenda rows: Start button, area badge and estimate
- [x] 14. Agenda rows: only the time, or "All day", instead of repeating "Today"
- [x] 15. Overdue: undo for moving a task, plus Tomorrow and Pick a date (bulk moves stay out of scope, as in 049)
- [ ] ~~16. Show today's routines on Home~~ Dropped: not wanted there
- [x] 17. Home's running session card names the task and shows the time left
- [x] 18. Timer: Done is the primary action; Bail and Discard are quiet
- [x] 19. Timer: the task's title shows once during a session
- [x] 20. Timer setup: list today's and recent tasks, and create a task when nothing matches
- [x] 21. Timer setup: duration presets
- [x] 22. Mini timer: task name and paused state, clear of the list on phones
- [x] 23. Task pane: ghost chips for date, area and estimate, as in the Calendar's popover
- [x] 24. Due dates in lists on phones, under the title
- [x] 25. A visible menu on areas and routine rows, besides the right click
- [x] 26. Hide the area navigation above an open task on phones
- [x] 27. Group long lists: Overdue, Today, Upcoming, No date

## P2: Consistency and accessibility

- [x] 28. One date and time formatter, and a 12/24-hour setting
- [x] 29. Due-date labels and routines follow the week start picked in Settings
- [x] 30. Light inputs are 1.04–1.10:1 against the page. Give `--input` a visible colour, aiming for 3:1
- [x] 31. Checkbox borders are 2.2:1 (light) and 2.7:1 (dark). Drop the 50% opacity
- [x] 32. Routine day circles: outline the empty ones and ring today
- [x] 33. Dark primary buttons are 1.4:1 against the card. Keep the purple, add a lighter border
- [x] 34. Parking lot actions on phones: 44px targets, or one labelled button and a menu
- [x] 35. Skeletons while Home, lists and panes load
- [x] 36. Respect `prefers-reduced-motion`
- [x] 37. One look for "selected" (now yellow, coral, purple and grey)
- [x] 38. One look for Start (now a square icon, pill, triangle and bar)
- [x] 39. One word each for Begin, Start, Resume; "Focus for" instead of "Estimate" where it sets the timer

## P3: Polish

- [x] 40. Calendar: space under the header, no half-cut times on short events, a legend
- [x] 41. Calendar: a visible save button in the new task popover
- [x] 42. Date picker: Today, Tomorrow, Next week
- [x] 43. Sound picker: show names
- [x] 44. Routine form: sticky footer, appearance collapsed
- [x] 45. Routine stats: three in a row on phones
- [x] 46. Quick start: label the steps icon "Add steps"
- [x] 47. Step rows: reveal the delete icon on hover
- [x] 48. Empty panes: the mascot and a next action
- [x] 49. A first-run checklist
- [x] 50. Sign in: one-line description, autofocus, "Forgot password?" by its field

## Decisions

| Issue | Choice |
| --- | --- |
| 2 | Moved to pages of their own in 052. Completed tasks are listed most recently changed first (`updated_at`), as no completion time is stored. Rows only reopen a task; they don't open it |
| 3 | Offered after Done only. Bailing means the task isn't finished |
| 30 | The description box goes without an outline or a focus ring in both themes: it's read more than filled in. Its placeholder shows what it is, and the caret shows it has focus |
| 28 | "12 Nov" and "5:30pm" (or "17:30") everywhere, through `utils/dateTime.ts`. `user_preferences.time_format` defaults to the 12-hour clock. Browser time inputs (a routine's reminder, logging time) follow the browser's locale and can't be set |
| 23 | Changes plan 042: an unset date, area or estimate is offered beside the set ones rather than in the menu, which keeps Add step and Delete |
| 11 | ⌘K (Ctrl+K) searches. ⌥N (Alt+N) adds a task to the Inbox, except while typing, as ⌥N types "˜" on a Mac. Both are in the sidebar too |
| 27 | A task that was due earlier today is under Overdue, as its red date says. With one group there are no headings |
| 37 | The accent everywhere: with an edge for a picked choice, plain for the open page, list or row. It replaces Quick start's yellow and the coral lengths. Dates in calendars keep the solid purple, as calendars do |
| 38 | Play (outlined) always. A page's or pane's main action is a filled button with its word; a row's is a ghost icon |
| 39 | Start begins something, Resume goes back to it. Begin is gone |
| 19 | The heading beside the clock takes over the pane's in-place title editing |
