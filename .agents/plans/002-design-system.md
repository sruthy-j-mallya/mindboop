# 002 — Design system tokens

Status: done
Date: 2026-10-31

## Goal

Adopt the Mind Boop design system from the Figma Make file
(`XZl3ovzjedJ28yDPG5WpoV`, "Design System for MindBoop") as CSS design tokens and restyle the app.

## Decisions

| Area | Choice |
| --- | --- |
| Tokens | `app/frontend/styles/tokens.css`: brand palette + semantic shadcn tokens (light `:root`, dark `.dark`) copied from the Make file's `theme.css` |
| Tailwind | `application.css` maps tokens in `@theme inline` (`bg-brand-coral`, `bg-input-background`, `font-display`, …) |
| Font | Inter (Notion's UI font) self-hosted via `@fontsource-variable/inter`, with Notion's system fallback stack. Used for body and display, replacing the Make file's DM Sans / Space Grotesk |
| Typography | h1–h4 defaults (bold, tight tracking) in `@layer base`, per the Make file |
| Components | Inputs use the filled `input-background`; card titles use display font/bold; links use `text-primary` |
| Logo | `app/frontend/images/logo.png` (512px) via `<Logo />` on auth pages and home; also `public/icon.png` favicon/PWA icon (default `icon.svg` removed) |
