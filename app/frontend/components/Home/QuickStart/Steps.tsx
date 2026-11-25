import { type Control, useFieldArray, type UseFormSetValue, useWatch } from "react-hook-form";

import CommonSteps from "@/components/commons/Steps";
import type { StepsProps as CommonStepsProps } from "@/components/commons/Steps/types";

import type { QuickStartFormValues } from "./constants";

type StepsProps = {
  control: Control<QuickStartFormValues>;
  setValue: UseFormSetValue<QuickStartFormValues>;
} & Pick<CommonStepsProps, "draft" | "onDraftChange">;

const Steps = ({ control, setValue, draft, onDraftChange }: StepsProps) => {
  const { fields, append, insert, move, remove } = useFieldArray({ control, name: "steps" });
  // Field array rows keep the values they were added with, so the current text and ticks come from the form.
  const values = useWatch({ control, name: "steps" });
  const steps = fields.flatMap(({ id }, index) => {
    const value = values.at(index);

    return value ? [{ id, ...value }] : [];
  });
  const indexOf = (id: string) => fields.findIndex((field) => field.id === id);

  // Steps owns the focus, moving it to the next new step row, so the form leaves it alone.
  const handleAdd = (text: string, index?: number) =>
    index === undefined
      ? append({ text, isDone: false }, { shouldFocus: false })
      : insert(index, { text, isDone: false }, { shouldFocus: false });
  const handleRename = (id: string, text: string) =>
    setValue(`steps.${indexOf(id)}.text`, text, { shouldDirty: true });
  const handleToggle = (id: string, isDone: boolean) =>
    setValue(`steps.${indexOf(id)}.isDone`, isDone, { shouldDirty: true });
  const handleRemove = (id: string) => remove(indexOf(id));
  const handleMove = (id: string, toIndex: number) => move(indexOf(id), toIndex);

  return (
    <CommonSteps
      draft={draft}
      steps={steps}
      onAdd={handleAdd}
      onDraftChange={onDraftChange}
      onMove={handleMove}
      onRemove={handleRemove}
      onRename={handleRename}
      onToggle={handleToggle}
    />
  );
};

export default Steps;
