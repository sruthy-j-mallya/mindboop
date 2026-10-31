import type { ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormFieldProps = ComponentProps<typeof Input> & { label: string; name: string; error?: string };

const FormField = ({ label, name, error, ...inputProps }: FormFieldProps) => {
  const errorId = `${name}-error`;

  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={!!error}
        id={name}
        name={name}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
