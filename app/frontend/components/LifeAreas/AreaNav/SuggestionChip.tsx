import { Check } from "lucide-react";

import type { CreateLifeAreaPayload } from "@/apis/types";
import { SOUNDS } from "@/components/commons/Ambience/constants";
import { toAreaColorStyle } from "@/components/commons/LifeArea/utils";

type SuggestionChipProps = {
  suggestion: CreateLifeAreaPayload;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: (name: string) => void;
};

// A suggested area in its colour: its emoji, its name and its background sound, which gives way to a tick once picked.
const SuggestionChip = ({ suggestion, isSelected, isDisabled, onToggle }: SuggestionChipProps) => {
  const { name, color, emoji, defaultSound } = suggestion;
  const sound = SOUNDS.find(({ id }) => id === defaultSound);
  const TrailingIcon = isSelected ? Check : sound?.icon;

  return (
    <button
      aria-label={name}
      aria-pressed={isSelected}
      className="area-tint flex items-center gap-1.5 rounded-full border border-transparent px-3 py-1 text-sm font-medium transition-[filter,border-color] outline-none hover:brightness-95 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 aria-pressed:border-current dark:hover:brightness-125"
      disabled={isDisabled}
      style={toAreaColorStyle(color)}
      title={sound ? `${name}, with ${sound.label.toLowerCase()} sounds` : name}
      type="button"
      onClick={() => onToggle(name)}
    >
      <span aria-hidden>{emoji}</span>
      {name}
      {TrailingIcon && <TrailingIcon aria-hidden className="size-3.5 opacity-70" />}
    </button>
  );
};

export default SuggestionChip;
