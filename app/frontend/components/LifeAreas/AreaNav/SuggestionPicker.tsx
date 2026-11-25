import { type ReactNode, useState } from "react";

import { toast } from "sonner";

import type { ApiError } from "@/apis/axios";
import { Button } from "@/components/ui/button";
import { useCreateLifeAreas } from "@/hooks/reactQuery/useLifeAreasApi";

import { LIFE_AREA_SUGGESTIONS } from "../constants";
import { getAddAreasLabel } from "../utils";
import SuggestionChip from "./SuggestionChip";

type SuggestionPickerProps = {
  // Shown below the button that adds the picked areas.
  children?: ReactNode;
};

// The suggested areas to start with: any number are picked, then added together.
const SuggestionPicker = ({ children }: SuggestionPickerProps) => {
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const { mutate: createLifeAreas, isPending } = useCreateLifeAreas();
  const selected = LIFE_AREA_SUGGESTIONS.filter(({ name }) => selectedNames.includes(name));

  const handleToggle = (name: string) =>
    setSelectedNames((names) =>
      names.includes(name) ? names.filter((selectedName) => selectedName !== name) : [...names, name],
    );

  const handleError = (error: ApiError) => toast.error(error.message);

  const handleAdd = () => createLifeAreas(selected, { onError: handleError });

  return (
    <>
      <ul aria-label="Suggested areas" className="flex flex-wrap gap-2">
        {LIFE_AREA_SUGGESTIONS.map((suggestion) => (
          <li key={suggestion.name}>
            <SuggestionChip
              isDisabled={isPending}
              isSelected={selectedNames.includes(suggestion.name)}
              suggestion={suggestion}
              onToggle={handleToggle}
            />
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2 lg:flex-col">
        <Button disabled={isPending || selected.length === 0} size="sm" type="button" onClick={handleAdd}>
          {getAddAreasLabel(selected.length)}
        </Button>
        {children}
      </div>
    </>
  );
};

export default SuggestionPicker;
