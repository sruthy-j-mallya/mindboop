import { type Control, useFieldArray, type UseFormSetValue, useWatch } from "react-hook-form";

import CommonSteps from "@/components/commons/Steps";

import type { QuickStartFormValues } from "./constants";

type StepsProps = {
  control: Control<QuickStartFormValues>;
  setValue: UseFormSetValue<QuickStartFormValues>;
};

const Steps = ({ control, setValue }: StepsProps) => {
  const { fields, append, move, remove } = useFieldArray({ control, name: "steps" });
  // Field array rows keep the values they were added with, so the current text and ticks come from the form.
  const values = useWatch({ control, name: "steps" });
  const steps = fields.flatMap(({ id }, index) => {
    const value = values.at(index);

    return value ? [{ id, ...value }] : [];
  });
  const indexOf = (id: string) => fields.findIndex((field) => field.id === id);

  // Focus stays on the add input so several steps can be typed in a row.
  const handleAdd = (text: string) => append({ text, isDone: false }, { shouldFocus: false });
  const handleRename = (id: string, text: string) =>
    setValue(`steps.${indexOf(id)}.text`, text, { shouldDirty: true });
  const handleToggle = (id: string, isDone: boolean) =>
    setValue(`steps.${indexOf(id)}.isDone`, isDone, { shouldDirty: true });
  const handleRemove = (id: string) => remove(indexOf(id));
  const handleMove = (id: string, toIndex: number) => move(indexOf(id), toIndex);

  return (
    <CommonSteps
      steps={steps}
      onAdd={handleAdd}
      onMove={handleMove}
      onRemove={handleRemove}
      onRename={handleRename}
      onToggle={handleToggle}
    />
  );
};

export default Steps;
