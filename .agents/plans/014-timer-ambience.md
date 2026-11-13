# 014 — Background sound on the Timer

Status: done
Date: 2026-11-11

## Goal

Let people pick a background sound on the Timer page (inspired by TickTick's focus sounds) that loops while the clock
runs: a quiet cue that time is passing, or an ambience to settle into the task.

## Decisions

| Area | Choice |
| --- | --- |
| Sounds | None, Clock, White noise, Brown noise, Piano, Rain, Waves, Wind, Campfire. Steady, low-detail textures; Piano (which replaced Pink noise) is the one melodic option, a slow pentatonic phrase that never clashes |
| Source | Synthesised in the browser with the Web Audio API (`Timer/Ambience/utils.ts`). No audio files, so nothing to license or download, and nothing added to the bundle beyond the code |
| Looping | Each sound is a few seconds of generated buffer on `loop`, so it repeats gaplessly. Noise is filtered over its own buffer twice so the loop has no seam; layered loops have different lengths and slow LFOs sway waves and wind, so the repeat isn't noticeable. Piano is a 30-second phrase whose note tails wrap around the loop, played through a generated-impulse reverb |
| When it plays | While the time log is running and time is left (a stopwatch has no end). It fades out on pause, when the time is up, and when the session ends (Done, Bail or discard unmount the Session) |
| Preference | Sound and volume are kept in `localStorage` (`ambience.sound`, `ambience.volume`), as a per-browser preference. Defaults to None at 50% volume |
| Autoplay | The audio context is created only once there's something to play. After a reload the browser may hold audio until a gesture, so it resumes on the next click or key press |
| UI | A round icon button in the Session header (showing the chosen sound) opens a popover with a 3×3 grid and a volume slider. Added shadcn `popover` |
| Left for later | Saving the preference on the server, more sounds, and mixing several sounds at once |
