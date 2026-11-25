# 045 — Reorder areas of life

Status: done
Date: 2026-11-25

## Goal

Let the user put their areas of life in the order they want, by dragging them in the areas sidebar. The order is saved
and used wherever areas are listed. Replaces the "oldest first" order from `039-life-areas.md`.

## Decisions

| Area | Choice |
| --- | --- |
| Model | `life_areas.position` (integer, not null), as in `checklist_items`. A new area goes last, counting deleted ones |
| Shared code | `ChecklistItem`'s `move_to!` and `set_position` move to a `Positionable` concern, used by both models |
| API | `PATCH /api/life_areas/:id` also takes `position`: the 0-based index among the user's undeleted areas. Too high goes last; anything but a whole number of 0 or more is a 422. No new endpoint, as with checklist items |
| Response | Unchanged. `GET /api/life_areas` comes back in order, so `position` isn't rendered |
| Where it shows | The sidebar, the area picker and the delete dialog's "Move tasks to" all read `useLifeAreas`, so they follow with no change. The Inbox stays first and can't be moved |
| Handle | A grip ("Reorder <name>") on each area, styled like the task and step grips: shown on hover or focus, always on touch screens. The link still clicks, and its right click / long press still opens the menu |
| Keyboard | Space or Enter on the grip, arrow keys, then Space or Enter; Escape cancels |
| Saving | Optimistic. On failure the order goes back, with an error toast. No toast on success |
| Out of scope | Reordering tasks, moving the Inbox, choosing a position in the New/Edit dialog |

## Backend

1. **Migration.** Neither `create_life_areas` nor `add_life_area_to_tasks` is on `main`, so edit `create_life_areas` in
   place: add `t.integer :position, null: false`, make the `user` reference `index: false`, and add an index on
   `%i[ user_id position ]` (it covers lookups by user).
   - Roll back only those two, newest first (`20261122120000` is on `main` and stays up):
     `bin/rails db:migrate:down VERSION=20261119120001`, then `VERSION=20261119120000`. Edit, then `bin/rails db:migrate`.
   - **This drops the development areas and which area each task is in.** Tasks themselves stay (in the Inbox). Check
     before running it.
2. **`app/models/concerns/positionable.rb`.** Takes the owner's foreign key from the model
   (`positioned_within :task_id` / `:user_id`), and holds:
   - `scope :in_position_order, -> { order(:position, :created_at, :id) }`
   - `move_to!(index)`: today's code, with the lookup by the declared key. Kept records swap their existing positions.
   - `before_create :set_position`: today's code, using the foreign key column. It must still work for checklist items
     nested in a new task, whose `task_id` is only set at save.
3. **`LifeArea` and `ChecklistItem`** include it. Remove `LifeArea.in_created_order`.
4. **`Api::LifeAreasController`**
   - `index`: `policy_scope(LifeArea).in_position_order`.
   - `update`: in one transaction, `update!(life_area_params)`, then `move_to!(params[:position])` if
     `params.key?(:position)`. `position` stays out of `life_area_params`. The existing `update?` policy covers it.
5. **`docs/api.md`**: the PATCH row, and the Life areas section ("oldest first" becomes the user's order).

## Frontend

1. **API types.** `UpdateLifeAreaPayload` gains `position?: number`; `lifeAreasApi.update` already passes it on.
2. **`useMoveLifeArea`** in `useLifeAreasApi.ts`, wrapping `lifeAreasApi.update`:
   - `onMutate` cancels the list query and reorders the cache. The cache also holds deleted areas, so work out the order
     of the kept ones and put the deleted ones after; the index sent counts kept areas only.
   - `onError` puts the previous list back.
   - `onSettled` invalidates the list, only when no other move is in flight (as `useChecklistItemsApi` does).
   - A mutation `scope`, so quick successive moves reach the server in order.
3. **Drag data.** `DragData` becomes a union: `{ type: "task", task }` or `{ type: "area", lifeArea }`. `TaskRow` sets the
   first. Areas must sort in the **existing** `DndContext` in `LifeAreas/index.tsx`: a nested one would capture the nav
   items' drop targets and break dropping tasks on them.
4. **`AreaNav`** wraps its list in a `SortableContext` of the area ids.
5. **`NavItem` / `AreaItem`.** Areas use `useSortable` (both drag source and drop target) in place of `useDroppable`; the
   Inbox keeps `useDroppable`, disabled while an area is dragged. Hooks can't be conditional, so split: `NavItem` keeps
   the link, count and menu and takes the node ref, style and handle as props; `InboxItem` and `AreaItem` own the dnd
   hooks. `setActivatorNodeRef`, `attributes` and `listeners` go on the grip only. Leave the same leading space on the
   Inbox so the icons line up.
6. **`LifeAreas/index.tsx`** branches on the dragged type:
   - `handleDragEnd`: a task calls `moveTask`, as now. An area dropped on another area calls `moveArea(id, index)`
     (`useMoveArea` beside `useMoveTask`, with the error toast).
   - Collision detection: unchanged for tasks; `closestCenter` for areas.
   - Keyboard: `sortableKeyboardCoordinates` for areas, the default for tasks.
   - `DragOverlay`: it always positions an overlay for the active item, even with no children, so an area needs one too.
     `DraggedArea` (badge and name); the row in the list dims.
   - Announcements name the task or area. dnd-kit's defaults read out raw ids, for today's task drags too.
7. **Narrow screens.** The areas are a sideways row below `lg`. A `useMediaQuery` hook picks
   `horizontalListSortingStrategy` there and `verticalListSortingStrategy` otherwise. `NARROW_LAYOUT_QUERY` moves up to
   `LifeAreas/constants.ts`. The grip needs `touch-none`; swiping the rest of the row still scrolls it.

## Tests

- **Models**: the checklist item tests still pass untouched. `LifeArea`: a new area goes last (also after a deleted one);
  positions are per user; moving up, down, past the end and to an invalid index; a deleted area is skipped when counting.
  Replaces the `in_created_order` test.
- **Controller**: PATCH with `position` reorders the index; with `name` too, saves both; an invalid position gets a 422
  and saves neither; another user's areas keep their order; unauthenticated (401); another user's area (403); a deleted
  area (404).
- **Vitest**: `useMoveLifeArea` reorders at once and keeps deleted areas, rolls back on failure. Drag-end handling goes in
  a pure helper in `utils.ts` (dragged + over → task move, area move or nothing) and is tested there, as jsdom has no
  layout for real drags. The grip is there for areas, not for the Inbox.
- **Playwright** (`life_areas.spec.ts`): drag an area above another, reload, order kept; the same by keyboard; dropping a
  task on an area still moves it; clicking an area still opens it; reorder in the narrow layout.

## Order of work

1. Migration, concern, models and their tests
2. Controller, docs and tests
3. API types, `useMoveLifeArea`
4. Drag and drop, then the narrow layout
5. E2E, then the full check: `bin/rubocop && pnpm lint && pnpm typecheck && bin/rails test && pnpm test && pnpm e2e`
6. Set this plan to done, and note in `039-life-areas.md` that reordering landed here

## Risks

- **Two kinds of drag in one context.** The main risk is breaking task drops, so e2e covers both together.
- **Simultaneous creates** can give two areas the same position (checklist items have this too). Ties list in created
  order, but swapping them does nothing. Unlikely for one user's areas, so left as is.
