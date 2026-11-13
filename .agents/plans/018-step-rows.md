# 018 — Step rows

Status: done
Date: 2026-11-13

## Goal

Add steps in place, as rows that look like the saved ones, instead of through a separate input and + button. Enter in
any step starts a new step right below it.

## Decisions

| Area | Choice |
| --- | --- |
| Add button | `commons/Steps/AddStepButton.tsx`, a `ListTodo` icon ("Add step"): on Quick Start at the top right beside the title input, on the Timer at the top right of the steps column, with the steps below it. It only starts the first step, and Enter adds the rest. It's hidden once the task has steps; on Quick Start also while a new step row is open, while on the Timer it stays so the first row opens right below it without jumping |
| Draft state | The new step row (`Draft`) is held by the screen (`QuickStart`, `Timer/Session`) and passed to `Steps` as `draft` / `onDraftChange`, since the button sits outside the list |
| Drag handle | A narrow `icon-xs` button (16px wide, 12px grip), pulled close to the checkbox so steps sit near the left edge; the new step row keeps a matching spacer. Transparent until its row is hovered, holds focus or is being dragged (`group-hover` / `group-focus-within`), keeping its space so the row doesn't shift. Always shown on coarse pointers (`pointer-coarse`), which can't hover |
| Remove focus | Removing a step moves focus to the next step's checkbox, or the previous one's when it was last |
| New step row | `commons/Steps/DraftStep.tsx`: a disabled checkbox, an input ("New step") and a discard button, like a saved step. Nothing is saved until the row is: leaving the row saves non-blank text and discards blank text. Escape or the discard button throws it away |
| Enter | Enter in a new step saves it and opens the next row below it. Enter in a step being edited saves the edit and opens a new row right below that step. Enter in a blank new step does nothing |
| Placement | A draft opened from the add button has no index, so it stays last even while steps above it are still saving. A draft opened by Enter carries the index it lands on, and `onAdd(text, index)` inserts there (`insert` on the Quick Start field array, `position` on the API) |
| API | `POST /api/tasks/:task_id/checklist_items` accepts an optional `position`, applied with `move_to!` in the same transaction, so an invalid one saves nothing |
| Cache | `useCreateChecklistItem` adds the step to the cached task at once with a stand-in id, and rolls back on failure, so a step typed straight after it lands below it without a jump |
