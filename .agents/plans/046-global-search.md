# 046 — Global search

Status: done
Date: 2026-11-25

## Goal

Replace the search in each task list with one that finds tasks from any page, by title, description or step.

## Decisions

| Area | Choice |
| --- | --- |
| Where | A Search item at the top of the app sidebar, on every page, opening a dialog. The Inbox and area lists no longer have their own |
| What it finds | Undeleted, incomplete tasks in every list, as the lists' search did |
| Matching | Any part of the title, the description (its Markdown) or an undeleted step, ignoring case |
| Endpoint | `GET /api/tasks?search_term=…&is_searching_details=true`. Without the flag only titles match, so the Timer's picker and the Calendar's suggestions, which show only titles, are unchanged |
| Results | The first page, soonest due first, each with its list and, when the title doesn't match, what did. Picking one opens it in its list |
