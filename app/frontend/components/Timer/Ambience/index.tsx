import { type ChangeEvent, useId } from "react";

import { cn } from "cn";

import type { TimeLog } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import useCurrentTime from "@/hooks/useCurrentTime";

import { isTicking } from "../utils";
import { MAX_VOLUME, NO_SOUND, SOUNDS } from "./constants";
import useAmbience from "./useAmbience";
import useAmbiencePreference from "./useAmbiencePreference";

type AmbienceProps = { timeLog: TimeLog };

const Ambience = ({ timeLog }: AmbienceProps) => {
  const volumeId = useId();
  const { soundId, setSoundId, volume, setVolume } = useAmbiencePreference();
  const currentTime = useCurrentTime(timeLog.isRunning);
  // Plays while the clock runs; stops for breaks and once the time is up.
  useAmbience({ soundId, volume, isPlaying: isTicking(timeLog, currentTime) });

  const selectedSound = SOUNDS.find(({ id }) => id === soundId) ?? SOUNDS[0];
  const SelectedIcon = selectedSound.icon;

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => setVolume(Number(event.target.value));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label={`Background sound: ${selectedSound.label}`}
          className={cn("shrink-0 rounded-full", soundId !== NO_SOUND && "text-primary")}
          size="icon"
          type="button"
          variant="ghost"
        >
          <SelectedIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" aria-label="Background sound" className="flex w-80 flex-col gap-5">
        <div className="grid grid-cols-3 gap-x-2 gap-y-4">
          {SOUNDS.map(({ id, label, icon: Icon }) => {
            const isSelected = id === soundId;

            return (
              <button
                key={id}
                aria-pressed={isSelected}
                className="group flex flex-col items-center gap-1.5 rounded-xl text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                type="button"
                onClick={() => setSoundId(id)}
              >
                <span
                  className={cn(
                    "flex size-11 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-accent",
                    isSelected && "bg-primary text-primary-foreground group-hover:bg-primary",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                {label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium" htmlFor={volumeId}>
            Volume
          </label>
          <input
            className="w-full accent-primary"
            id={volumeId}
            max={MAX_VOLUME}
            min={0}
            type="range"
            value={volume}
            onChange={handleVolumeChange}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Ambience;
