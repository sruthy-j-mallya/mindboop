import { cn } from "cn";
import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

type ChoiceOption = { value: string; label: string; content: ReactNode };

type ChoiceFieldProps = {
  legend: string;
  hint?: string;
  options: ChoiceOption[];
  registration: UseFormRegisterReturn;
  // Shows the options' names beside them, where the pictures alone don't say enough.
  hasLabels?: boolean;
};

// A row of rounded radio buttons (colours, sounds), each named by its label. The input lies see-through over its
// circle, so a click anywhere on it picks it.
const ChoiceField = ({ legend, hint, options, registration, hasLabels = false }: ChoiceFieldProps) => (
  <fieldset className="grid gap-2">
    <legend className="mb-2 text-sm font-medium">{legend}</legend>
    {hint && <p className="-mt-1 text-sm text-muted-foreground">{hint}</p>}
    <div className="flex flex-wrap gap-1.5">
      {options.map(({ value, label, content }) => (
        <label key={value} className="relative" title={label}>
          <input
            {...registration}
            aria-label={label}
            className="peer absolute inset-0 cursor-pointer appearance-none rounded-full opacity-0"
            type="radio"
            value={value}
          />
          <span
            className={cn(
              "flex h-9 items-center justify-center gap-1.5 rounded-full border-2 border-transparent bg-muted text-sm transition-colors peer-checked:border-(--primary-text) peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 hover:bg-accent",
              hasLabels ? "px-3" : "w-9",
            )}
          >
            {content}
            {hasLabels && <span aria-hidden>{label}</span>}
          </span>
        </label>
      ))}
    </div>
  </fieldset>
);

export default ChoiceField;
