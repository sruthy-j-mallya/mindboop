import type { ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import PasswordInput from "./PasswordInput";

type FormFieldProps = ComponentProps<typeof Input> & {
  label: string;
  name: string;
  error?: string;
  hint?: string;
};

const FormField = ({ label, name, error, hint, ...inputProps }: FormFieldProps) => {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ");
  const FieldInput = inputProps.type === "password" ? PasswordInput : Input;

  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <FieldInput
        aria-describedby={describedBy || undefined}
        aria-invalid={!!error}
        id={name}
        name={name}
        {...inputProps}
      />
      {hint && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
