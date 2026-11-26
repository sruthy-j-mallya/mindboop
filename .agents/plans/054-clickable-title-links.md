# 054 — Clickable links in task titles

Status: done
Date: 2026-11-26

## Goal

A web address typed into a task title (`Read https://example.com/post`) shows as a link, styled like links in a
task's notes, and opens in a new tab when clicked.

## Decisions

- **Detection**: `http://` / `https://` addresses and bare `www.` addresses (opened as `https://`). Trailing
  sentence punctuation (`.,;:!?` and unbalanced `)`) stays outside the link. Only `http(s)` hrefs are rendered.
- **Styling**: the same as links in rich-text notes: `font-medium text-primary underline underline-offset-2`.
- **Opening**: `target="_blank" rel="noopener noreferrer"`.
- **Editable titles** (`TitleInput`: task board row, task pane, timer): a `<textarea>` can't hold links, so when the
  title has a link and isn't being edited, it shows as text with live links. Clicking a link opens it; clicking
  anywhere else on the title (or tabbing to it) switches to the textarea, caret at the end, exactly as before.
  Titles without links keep the plain textarea, so nothing changes for them.
- **Read-only titles**: the Calendar's read-only task popover, the completed/deleted archive and the "On the clock"
  card show links too.
- **Home rows**: the title is itself a link to the task, and links can't nest, so the text segments stay links to
  the task and each address becomes its own external link beside them.
- **Left as plain text**: titles inside buttons or inputs (search results, task suggestions, the timer's task search,
  the drag preview, calendar event blocks), where a nested link would be invalid or steal the row's click.

## Where

- `components/commons/LinkifiedText/` (`index.tsx`, `utils.ts` with `splitLinks`, `types.ts`, tests): the shared
  renderer.
- `components/commons/TitleInput.tsx`: display mode for titles with links.
- `Home/TaskRow.tsx`, `LifeAreas/TaskArchive/ArchiveRow.tsx`, `Calendar/TaskPopover/ReadOnlyDetails.tsx`,
  `commons/SwitchSessionDialog/RunningSession.tsx`.
