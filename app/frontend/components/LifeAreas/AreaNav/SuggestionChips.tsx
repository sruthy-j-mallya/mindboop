import { toast } from "sonner";

import type { ApiError } from "@/apis/axios";
import type { CreateLifeAreaPayload, LifeArea } from "@/apis/types";
import { SOUNDS } from "@/components/commons/Ambience/constants";
import { findLifeAreaIcon } from "@/components/commons/LifeArea/utils";
import { useCreateLifeArea } from "@/hooks/reactQuery/useLifeAreasApi";

import { LIFE_AREA_SUGGESTIONS } from "../constants";
import { isNameTaken, toAreaColorStyle } from "../utils";

type SuggestionChipsProps = { lifeAreas: LifeArea[] };

// The suggested areas not added yet, as chips in each one's colour: its icon, its name and its background sound. Picking
// one adds it.
const SuggestionChips = ({ lifeAreas }: SuggestionChipsProps) => {
  const { mutate: createLifeArea, isPending } = useCreateLifeArea();
  const suggestions = LIFE_AREA_SUGGESTIONS.filter(({ name }) => !isNameTaken(lifeAreas, name));

  const handleError = (error: ApiError) => toast.error(error.message);

  const handleAdd = (suggestion: CreateLifeAreaPayload) =>
    createLifeArea(suggestion, { onError: handleError });

  if (suggestions.length === 0) {
    return <p className="text-sm text-muted-foreground">You’ve added every suggestion.</p>;
  }

  return (
    <ul aria-label="Suggested areas" className="flex flex-wrap gap-2">
      {suggestions.map((suggestion) => {
        const { name, color, icon, defaultSound } = suggestion;
        const lifeAreaIcon = findLifeAreaIcon(icon);
        const Icon = lifeAreaIcon.icon;
        const sound = SOUNDS.find(({ id }) => id === defaultSound);
        const SoundIcon = sound?.icon;

        return (
          <li key={name}>
            <button
              aria-label={`Add ${name}`}
              className="area-tint flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-[filter] outline-none hover:brightness-95 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 dark:hover:brightness-125"
              disabled={isPending}
              style={toAreaColorStyle(color)}
              title={sound ? `${name}, with ${sound.label.toLowerCase()} sounds` : name}
              type="button"
              onClick={() => handleAdd(suggestion)}
            >
              <Icon className="size-3.5" />
              {name}
              {SoundIcon && <SoundIcon className="size-3.5 opacity-70" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default SuggestionChips;
