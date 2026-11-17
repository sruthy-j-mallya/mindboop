# 034 — User preferences: theme and sounds

Status: done
Date: 2026-11-15

## Goal

Let people choose their theme, the sound that plays when a task is completed and the break alarm, and keep those
choices on their account so they follow them to every device.

## Decisions

| Area | Choice |
| --- | --- |
| Storage | A `user_preferences` table, one row per user (`has_one :preference`): `theme`, `completion_sound`, `break_alarm_sound`, each a string with a DB default and an inclusion validation. The row is built on read and saved on the first `PATCH`, so existing users need no backfill |
| Endpoint | `GET`/`PATCH /api/user_preference` (singular resource, `Api::UserPreferencesController`, `UserPreferencePolicy`). See `docs/api.md` |
| Theme | `system` (the default, follows the device), `light` or `dark`. The layout renders the saved theme into its first-paint script (`ApplicationHelper#theme_preference`); signed out, the device decides. `useApplyTheme` (in `AppLayout`) applies changes and sign-ins without a reload. Replaces the `theme` key in `localStorage` and the Dark mode switch |
| Completion sounds | Nine synthesised sounds plus Off, in `utils/completionSound/players.ts`. Rising tick-tick is the default; the 033 chime stays as Two-note chime; Bell is a single struck desk bell (E6, inharmonic partials). `playCompletionSound(id)` stays silent until the preference has loaded, so someone who turned it off never hears the default |
| Break alarm sounds | Classic beep (the original, the default), Digital, Chimes, Marimba and Bell: looping patterns of notes rendered into a buffer (`utils/alarmSound`). The alarm waits for the preference to load but rings Classic if loading fails. Settings previews 3 seconds of a loop. No Off: an alarm that can be silenced defeats its purpose |
| Settings | Appearance card with a Theme select; Sounds card with a select and a Play button per sound, Slack-style. Choosing plays the sound. Changes apply optimistically to the query cache and roll back with an alert if the save fails |
| Kept in the browser | The Timer's background sound and volume, which change often and per session (`useAmbiencePreference`, now using the shared `utils/storage.ts`) |
| Left for later | The curiosity-time alarm on `11-parking-lot-feature`: add a `curiosity_alarm_sound` column (same `ALARM_SOUNDS`), pass it to `startAlarmSound` in that branch's `useAlarm`, and add a row to the Sounds card |
