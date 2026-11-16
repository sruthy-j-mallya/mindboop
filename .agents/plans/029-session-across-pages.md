# 029 — Keep the session going across pages

Status: done
Date: 2026-11-16

## Goal

Leaving the Timer page through the sidebar used to stop the background sound and hide the clock. Keep the sound
playing and float a small timer, with a way back, on every other page.

## Decisions

| Area | Choice |
| --- | --- |
| Where it lives | `AppLayout/CurrentSession` reads the current time log and, while there is one, mounts the sound player and (off `/timer`) the mini timer. The layout never unmounts between pages, so neither does the audio |
| Sound | `Timer/Ambience` moved to `components/commons/Ambience`. Its `index.tsx` is now a player that renders nothing (`useAmbience` while `isTicking`, unchanged rules). The popover is `Ambience/Picker`, still in the Session header |
| Preference | Shared by the picker and the player, so it moved from component state (`useAmbiencePreference`) to the first Zustand store, `stores/useAmbienceStore.ts`, read through selectors. Same `localStorage` keys, so saved choices carry over |
| Mini timer | `AppLayout/MiniTimer`: a pill fixed bottom-right with just the clock (counts down, or up for a stopwatch; holds while paused) and a "Back to timer" icon link. Hidden on the Timer page. A toast (also bottom-right) briefly sits over it |
| Left for later | Pause/Done controls on the mini timer; dragging it elsewhere |
