import { Lightbulb } from "lucide-react";

import type { LifeArea } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import SuggestionChips from "./SuggestionChips";

type SuggestionsProps = { lifeAreas: LifeArea[] };

// The bulb: areas to start with, added with a click. It stays open, so several can be picked in a row.
const Suggestions = ({ lifeAreas }: SuggestionsProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button aria-label="Suggested areas" size="icon-sm" type="button" variant="ghost">
        <Lightbulb />
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" aria-label="Suggested areas" className="flex w-80 flex-col gap-3">
      <p className="text-sm font-medium">Start with an area of life</p>
      <SuggestionChips lifeAreas={lifeAreas} />
    </PopoverContent>
  </Popover>
);

export default Suggestions;
