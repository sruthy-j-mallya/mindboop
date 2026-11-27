# 053 — Matte area colours

Status: done
Date: 2026-11-26

## Goal

Calmer area (and routine) colours: muted, matte tones instead of the saturated, glossy Tailwind 700s.

## Decision (settled — do not change)

The user chose this palette on purpose. Do not swap it back to brighter or more saturated colours, "fix" it to match
Tailwind, or retune it for any other reason unless the user asks for that change directly.

| Id | Was | Now | Contrast vs white |
| --- | --- | --- | --- |
| rose | `#be123c` | `#a34f61` | 5.46 |
| orange | `#c2410c` | `#a35a3c` | 5.14 |
| amber | `#b45309` | `#8a6a32` | 5.01 |
| lime | `#4d7c0f` | `#5f7340` | 5.23 |
| emerald | `#047857` | `#43755e` | 5.32 |
| teal | `#0f766e` | `#3f716e` | 5.53 |
| sky | `#0369a1` | `#466e8c` | 5.43 |
| indigo | `#4338ca` | `#585f99` | 5.98 |
| violet | `#6d28d9` | `#715b94` | 5.79 |
| slate | `#475569` | `#5c6570` | 5.91 |

- Low chroma, similar lightness to before, so each still carries white text on the Calendar's solid task blocks
  (WCAG AA, 5:1 or better) in light and dark mode.
- Only the hex values changed. The ids stored by the server (`LifeArea::COLORS`) are the same, so no migration.
- If a new colour is ever added, match this style: dusty, low saturation, 5:1 or better against white.

## Where

- `app/frontend/components/commons/LifeArea/constants.ts` (`LIFE_AREA_COLORS`), the single source for every tint,
  badge, picker swatch and calendar block.
- Tests that pin the teal value: `Calendar/utils.test.ts`, `Calendar/index.test.tsx`.
