import { cn } from "cn";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

type OptionProps = { icon: ReactNode; label: string; isSelected: boolean; onPick: () => void };

const Option = ({ icon, label, isSelected, onPick }: OptionProps) => (
  <li>
    <button
      aria-pressed={isSelected}
      className={cn(
        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent focus-visible:bg-accent",
        isSelected && "font-medium",
      )}
      type="button"
      onClick={onPick}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {isSelected && <Check className="size-4 text-muted-foreground" />}
    </button>
  </li>
);

export default Option;
