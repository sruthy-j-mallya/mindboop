import { useEffect, useRef } from "react";

import { FADE_SECONDS, NO_SOUND } from "./constants";
import type { SoundId } from "./types";
import { playSound, volumeToGain } from "./utils";

type Output = { context: AudioContext; master: GainNode };

type UseAmbienceOptions = { soundId: SoundId; volume: number; isPlaying: boolean };

const UNLOCK_EVENTS = ["pointerdown", "keydown"] as const;

// Browsers start audio suspended until the page gets a gesture (after a reload, say), so resume on the next one.
const resumeWhenAllowed = (context: AudioContext) => {
  const resume = () => {
    if (context.state === "suspended") void context.resume().catch(() => undefined);
  };
  const handleGesture = () => {
    resume();
    UNLOCK_EVENTS.forEach((event) => document.removeEventListener(event, handleGesture));
  };

  resume();
  UNLOCK_EVENTS.forEach((event) => document.addEventListener(event, handleGesture));

  return () => UNLOCK_EVENTS.forEach((event) => document.removeEventListener(event, handleGesture));
};

// Plays the chosen sound on a loop for as long as `isPlaying` holds. The audio context is only created once
// there is something to play, and is closed when the component unmounts.
const useAmbience = ({ soundId, volume, isPlaying }: UseAmbienceOptions) => {
  const outputRef = useRef<Output | null>(null);
  const volumeRef = useRef(volume);

  useEffect(() => {
    volumeRef.current = volume;
    const output = outputRef.current;
    output?.master.gain.setTargetAtTime(volumeToGain(volume), output.context.currentTime, FADE_SECONDS / 5);
  }, [volume]);

  useEffect(() => {
    if (!isPlaying || soundId === NO_SOUND || typeof AudioContext === "undefined") return undefined;

    if (!outputRef.current) {
      const context = new AudioContext();
      const master = context.createGain();
      master.gain.value = volumeToGain(volumeRef.current);
      master.connect(context.destination);
      outputRef.current = { context, master };
    }

    const { context, master } = outputRef.current;
    const stopSound = playSound(context, master, soundId);
    const stopUnlocking = resumeWhenAllowed(context);

    return () => {
      stopUnlocking();
      stopSound();
    };
  }, [isPlaying, soundId]);

  useEffect(
    () => () => {
      void outputRef.current?.context.close().catch(() => undefined);
      outputRef.current = null;
    },
    [],
  );
};

export default useAmbience;
