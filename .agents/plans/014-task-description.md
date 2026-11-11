# 014 — Rich-text task description

Status: done
Date: 2026-11-12

## Goal

Let the user write a task description with formatting (issue #8): a WYSIWYG editor with toolbar buttons that also takes
Markdown syntax as you type. Write it on Quick Start; show it read-only on the Timer. `tasks.description` and the API
fields already existed; no screen used them.

## Decisions

| Area | Choice |
| --- | --- |
| Library | Tiptap v3 (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/markdown`, `@tiptap/extensions`), all MIT. Headless, so it's styled with our tokens and shadcn `Toggle`/`Popover`/`Tooltip`; Markdown input rules are built in. Rejected: MDXEditor (heavy, opinionated UI), Milkdown (harder to theme), raw Lexical (more DIY), BlockNote (block UI, some non-free packages). No paid Tiptap extensions are used |
| Storage | Markdown in the existing `description` text column. No migration. Portable and readable, and no HTML is stored |
| Rendering | `RichText/Viewer` is a read-only Tiptap editor with the same extensions as the editor, so stored Markdown can only render as nodes the editor can write. Raw HTML, images and tables are dropped; no `dangerouslySetInnerHTML` |
| Formats | Bold, italic, strikethrough, inline code, heading (H2) and subheading (H3), bullet list, numbered list, quote, code block, link. Undo/redo by keyboard. Left out: H1 (the title is the page heading), underline (not Markdown), horizontal rule, task lists (Steps cover checklists), images and tables |
| Links | Only `http`, `https` and `mailto` (`isAllowedLinkUrl`); others are rejected in the link form and rendered without an `href` if they come from stored Markdown. A bare `example.com` gets `https://`. Links open in a new tab with `rel="noopener noreferrer nofollow"`. Mod-K opens the link popover |
| Limits | `Task::MAX_DESCRIPTION_LENGTH = 10_000` characters of Markdown, mirrored by `TASK_DESCRIPTION_MAX_LENGTH`. Stripped, and blank is saved as `null` |
| Component | `components/commons/RichText/` (Editor, Toolbar, FormatButton, LinkPopover, Viewer), shared by Quick Start and Timer. The editor is uncontrolled (`defaultValue`) and reports Markdown through `onChange` |
| Bundle | Tiptap is ~147 kB gzipped, so it's code-split: callers use `LazyEditor` / `LazyViewer` (`React.lazy`), and the chunk loads only when an editor or a description is rendered. Login and signup don't load it. The editor shows a same-size skeleton while loading; the viewer shows nothing rather than flash raw Markdown. Nothing outside those two wrappers may import `Editor`, `Viewer` or `utils.ts` statically, or Tiptap falls back into the main bundle |
| Styling | Hand-written `.rich-text` styles in `application.css` on our tokens instead of `@tailwindcss/typography` |
| Placement | Quick Start: editor under the title. Timer: read-only below the countdown, so a long note doesn't push the timer down. Editing an existing task's description is left for a later change (`PATCH /api/tasks/:id` already accepts it) |
| Tests | jsdom has no layout, so `test/setup.ts` stubs `getClientRects`/`getBoundingClientRect`/`elementFromPoint` for ProseMirror. Typing into the editor is covered in Playwright (`e2e/quick_start.spec.ts`), since jsdom can't type into a contenteditable reliably |
