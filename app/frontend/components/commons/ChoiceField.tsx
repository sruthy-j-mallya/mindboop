import type { CSSProperties, ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

type ChoiceOption = { value: string; label: string; content: ReactNode; style?: CSSProperties };

type ChoiceFieldProps = {
  legend: string;
  hint?: string;
  options: ChoiceOption[];
  registration: UseFormRegisterReturn;
};

// A row of round radio buttons (colours, icons, sounds), each named by its label. The input lies see-through over its
// circle, so a click anywhere on it picks it.
const ChoiceField = ({ legend, hint, options, registration }: ChoiceFieldProps) => (
  <fieldset className="grid gap-2">
    <legend className="mb-2 text-sm font-medium">{legend}</legend>
    {hint && <p className="-mt-1 text-sm text-muted-foreground">{hint}</p>}
    <div className="flex flex-wrap gap-1.5">
      {options.map(({ value, label, content, style }) => (
        <label key={value} className="relative" style={style} title={label}>
          <input
            {...registration}
            aria-label={label}
            className="peer absolute inset-0 cursor-pointer appearance-none opacity-0"
            type="radio"
            value={value}
          />
          <span className="flex size-9 items-center justify-center border-2 border-transparent bg-muted transition-colors peer-checked:border-primary peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 hover:bg-accent">
            {content}
          </span>
        </label>
      ))}
    </div>
  </fieldset>
);

export default ChoiceField;
