import { Search } from "lucide-react";
import type { ChangeEvent, KeyboardEvent } from "react";

import { Input } from "@/components/ui/input";

type SearchFieldProps = { value: string; onChange: (value: string) => void };

// Narrows the list to tasks whose title contains the text. Escape clears it.
const SearchField = ({ value, onChange }: SearchFieldProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape" && value) onChange("");
  };

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        aria-label="Search tasks"
        autoComplete="off"
        className="pl-9"
        placeholder="Search tasks"
        type="search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default SearchField;
