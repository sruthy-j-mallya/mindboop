# 019 — Inline, autosaving task description

Status: done
Date: 2026-11-13

## Goal

Make the description easier to write in. On the Timer it is editable straight away, with no viewer, pencil, Save or
"Add a description" button. The format buttons stay hidden until asked for. Also make the description one reusable
component, since more screens and popovers will show it (follow-up to `014-task-description.md` and
`015-timer-editing.md`).

## Decisions

| Area | Choice |
| --- | --- |
| Component | `components/commons/TaskDescription` takes a `task` (plus optional `isAutoFocused`) and owns its own saving through `useUpdateTask`. Any screen or popover can drop it in. The editor is uncontrolled, so callers render it with `key={task.id}` wherever the task can change. Replaces `Timer/Description` (viewer + `DescriptionForm`) |
| Saving | Autosaves 800 ms after typing pauses (`DESCRIPTION_SAVE_DELAY`), straight away on blur, and on unmount so a closing popover keeps the edit. It skips a value equal to the last one sent. After a failed save it forgets that value, so the next blur retries. Server errors show in a `role="alert"` under the editor, and the edit stays put |
| Validation | `DESCRIPTION_SCHEMA` (trimmed, at most `TASK_DESCRIPTION_MAX_LENGTH`) runs on every change. A too-long description shows the error, marks the editor invalid, and isn't sent. Uses Zod without React Hook Form, since there's no submit |
| Toolbar | Hidden by default in every `RichText/Editor` (Quick Start too, for consistency). A "Show formatting" toggle (`FormattingToggle`, `aria-pressed`) in the editor's bottom-right corner (the text area has bottom padding to keep the last line clear of it) shows or hides it. The toolbar sits below the text, with the toggle at the end of its row. The toggle's mousedown is prevented, so the selection survives and a format applies right after opening. It renders after `EditorContent`: ProseMirror is `position: relative` and would otherwise cover it |
| Link popover | `LinkPopover` (form anchored to the link being edited) is mounted by the editor, not the toolbar. The toolbar's `LinkButton`, Mod-K and Edit in a link's hover menu each open it on their own, and none of them shows or hides the toolbar. Hiding the toolbar leaves an open popover alone |
| Viewer | `RichText/Viewer` / `LazyViewer` are now unused. Kept for read-only previews (such as a compact popover) |
