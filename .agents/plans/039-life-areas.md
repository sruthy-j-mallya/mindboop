# 039 — Areas of life

Status: done
Date: 2026-11-19

Icons were replaced by emojis in `040-life-area-emojis.md`. Deleting an area asks where its tasks go since
`044-delete-life-area.md`. Areas can be reordered since `045-reorder-life-areas.md`.

## Goal

Group tasks by areas of life (Work, Health, …). Tasks in no area stay in the Inbox. Areas get a colour, an icon and a
default background sound; tasks move between areas (and the Inbox) by dragging, and the Calendar shows each task and time
log in its area's colour.

## Decisions

| Area | Choice |
| --- | --- |
| Model | `LifeArea` (`life_areas`: `user_id`, `name`, `color`, `icon`, `default_sound` default `"none"`). `name` is required, up to 40 characters, squished, and unique per user ignoring case (validation plus a unique `(user_id, lower(name))` index). `color`, `icon` and `default_sound` are keys validated against `COLORS`, `ICONS` and `SOUNDS`, which mirror the client's lists |
| Tasks | Nullable `tasks.life_area_id` (FK `on_delete: :nullify`); `Task belongs_to :life_area, optional: true`. Without one, a task is in the Inbox. A task can only be put in its own user's area: another user's area, or an unknown id, fails validation as "Life area must exist" (422), so an id gives nothing away |
| Deleting an area | A hard delete (`dependent: :nullify`, and the FK nullifies too, which also covers discarded tasks): its tasks go back to the Inbox. The Edit dialog asks with a second click ("Delete area and move tasks"), then opens the Inbox with a toast |
| API | `GET/POST /api/life_areas`, `PATCH/DELETE /api/life_areas/:id` (`LifeAreaPolicy`, owner only). The list is unpaged, oldest first (`in_created_order`): a user keeps a handful and the sidebar shows them all. `GET /api/tasks` takes `is_in_inbox=true` (no area) and `life_area_id` (`Tasks::FilterService`, each returning early when not given). Tasks and time logs include `life_area_id` (a time log's is its task's) |
| Order | Task lists sort by due date (`starts_at`, undated last), then newest first (`created_at desc, id desc`), as asked: `Task.by_due_date`. No sort or filter controls on the lists |
| Navigation | The app sidebar's Inbox item became "Areas of life" (`Boxes` icon), leading to `/inbox` and active on `/inbox/*` and `/areas/*`. `LifeAreas` is a layout route: `AreaNav` (a second sidebar listing the Inbox and the areas; a column from `lg`, a sideways-scrolling row below it) beside the `<Outlet />` |
| Routes | `routes.inbox.index`/`show` stay. `routes.lifeAreas.show` (`/areas/:lifeAreaId`) and `.task` (`/areas/:lifeAreaId/:taskId`) render the same `TaskBoard` and `TaskPane`; `/areas` redirects to the Inbox. An unknown or deleted area leads to the Inbox. `useOpenTask` finds the open task and its list on either route, so completing, deleting and moving the open task close its pane |
| Task board | The Inbox feature moved to `LifeAreas/TaskBoard` and now serves both: `TaskBoard` resolves the area from the URL and renders `Board`, keyed by the list so a search doesn't carry over. Adding a task puts it in the area shown. The heading shows the area's badge and an edit button |
| Search | A search field on every list, debounced 300ms, sent as `search_term` with the list's own filters. Escape clears it. "No tasks match “…”" when nothing does |
| Adding areas | The `+` button opens the New dialog (`AreaForm`: name, colour swatches, icons shown in the picked colour, sound). The bulb opens the suggestions: Work, Health, Relationships, Household, Leisure, Learning and Finances as chips in each one's colour with its icon, name and sound icon; a click adds it as is, and added ones (by name, ignoring case) aren't offered again. Until the user has an area, the suggestions also show in the area sidebar |
| Editing | The pencil beside the area's heading opens the Edit dialog, the same `AreaForm`. A right click (or long press) on an area in `AreaNav` opens a context menu (shadcn `context-menu`, `AreaNav/AreaItem`) with Edit and Delete; Delete asks in `AreaDialog/Delete`. `useDeleteArea` deletes, and opens the Inbox only when the deleted area (or one of its tasks) was open |
| Area picker | `commons/LifeAreaPicker` (a popover listing the Inbox and the areas, hidden while the user has none) sits beside the due date and estimate. In the task pane and the Calendar's edit popover it's `commons/TaskLifeAreaPicker`, which saves at once and, for a task open beside a list, opens it beside its new list. The Calendar's new task form has it as `LifeAreaField` (`lifeAreaId` in the form, sent on create). The read-only time log popover shows no picker. `LifeAreaBadge` and `toAreaColorStyle` moved to `commons/LifeArea` for it |
| Colours | Ten keys, each a deep colour (Tailwind 700s) so white text reads on the Calendar's solid blocks in both themes. Elsewhere, `.area-tint` (application.css) tints a background with `--area-color` and mixes the text with the foreground so it stays readable in dark mode |
| Drag and drop | dnd-kit. `LifeAreas` holds the `DndContext` (pointer after 4px, and keyboard) and a `DragOverlay` with the task's title. Each list row has a grip handle ("Move <title>", shown on hover or focus, always on touch screens), and each `AreaNav` item is a drop target, outlined while a task that can move there is dragged. Dropping calls `PATCH /api/tasks/:id` with the new `life_area_id` (`useMoveTask`), with a "Moved … to …" toast or the error |
| Calendar | Events in an area get `calendar-event-area` and an inline `--area-color` (`getEventProps`, Calendar/utils): tasks solid in the colour, time logs tinted with a dashed edge in it. Events in no area keep the primary look |
| Default sound | A session on a task in an area starts with the area's sound (`useLifeAreaSound`, run by `AppLayout/SessionSound`). It switches once per session: the store keeps the session it switched for (in localStorage), so a sound picked during the session stays, even across reloads. `none` (shown as "None") starts the session in silence; a session on a task in the Inbox leaves the sound as it is |
| Out of scope | Reordering areas, an area legend or filter on the Calendar, and searching the area list itself |
