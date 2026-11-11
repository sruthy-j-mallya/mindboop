# 014 — Password visibility toggle

Status: done
Date: 2026-11-11

## Goal

Let people check the password they typed on sign in, sign up and password reset.

## Decisions

| Area | Choice |
| --- | --- |
| Component | `components/commons/PasswordInput.tsx` wraps the shadcn `Input` with an eye button that switches `type` between `password` and `text` |
| Wiring | `FormField` renders `PasswordInput` whenever `type="password"`, so every password field gets the toggle without changes to the screens |
| Accessibility | The button is `type="button"` (doesn't submit), labelled "Show password" / "Hide password", and points at its input with `aria-controls`. Each field toggles on its own |
| Tests | Vitest covers the toggle in `PasswordInput.test.tsx`, Login and CompleteSignup. The e2e sign-in step now uses an exact `Password` label, since "Show password" also matches a loose one |
