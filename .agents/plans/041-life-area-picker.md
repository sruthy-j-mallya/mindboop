# 041 — Life area picker

Status: done
Date: 2026-11-24

## Goal

Make the areas sidebar clearer: the Inbox apart from the areas, and several suggested areas added at once. This replaces
the "Adding areas" layout in `039-life-areas.md`.

## Decisions

| Area | Choice |
| --- | --- |
| Inbox | Above the "Areas of life" title |
| With areas | The list under the title. The title row has only `+` (New dialog); the bulb and its popover are gone |
| Without areas | No title buttons. A card of suggestion chips that toggle, "Add N areas", and "Add your own" (New dialog) |
| Saving | `useCreateLifeAreas` posts the picked areas one by one to the existing endpoint, in the suggestions' order. If one fails, the earlier ones stay, the list refreshes and the error shows as a toast |
