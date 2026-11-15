# 026 — Breadcrumbs timeline in the task pane

Status: done
Date: 2026-11-15

## Goal

Show the breadcrumbs left when bailing out of a session in the Inbox task pane, as a timeline.

## Decisions

| Area | Choice |
| --- | --- |
| Backend | The task JSON (`_task.json.jbuilder`) includes `breadcrumbs`, each `{ id, completed_description, restart_description, created_at }`. `Task#breadcrumbs` is ordered newest first; index, show and restoration preload them |
| Cache | Bailing out also invalidates the task's detail query, so the pane picks up the new breadcrumb |
| Placement | `Inbox/TaskPane/Breadcrumbs`, between the steps and the description, so where to pick up is seen first when coming back. Hidden when the task has none |
| Look | A vertical rail with a dot per breadcrumb, in `brand-yellow` (the Quick Start estimate button's selected colour). Each entry has a yellow time chip (`brand-yellow` / `brand-purple-dark`), then "Pick up from" and, when given, "Got done" |
