# 033 — Completion tone

Status: done (sound choice superseded by 034)
Date: 2026-11-15

## Goal

Play a short, gentle sound when a task is completed, so finishing something feels acknowledged.

## Decisions

| Area | Choice |
| --- | --- |
| Sound | A soft rising fifth (G5 then D6, 120 ms apart): sine notes with a quiet octave partial, a 15 ms attack and a 1.2 s exponential ring-out, at a low volume. Synthesised with Web Audio (`utils/completionSound.ts`), so no audio file |
| Audio context | The break alarm's context moved to `utils/audioContext.ts` (`getAudioContext`, `unlockAudio`), shared by the alarm and the chime. `unlockAlarmSound` became `unlockAudio` |
| Inbox | The chime plays with the click on a task's checkbox (row or pane), as the box ticks. The row can unmount before the save's per-call callbacks run, so it isn't tied to the response |
| Timer | Done unlocks audio in the click and plays the chime when the completion saves, as the Finished dialog opens. A failed save stays silent |
| Left for later | A setting to turn the sound off, and a chime for ticking off steps |
