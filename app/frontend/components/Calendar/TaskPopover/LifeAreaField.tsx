import { type Control, useController } from "react-hook-form";

import LifeAreaPicker from "@/components/commons/LifeAreaPicker";

import type { TaskFormValues } from "./constants";

type LifeAreaFieldProps = { control: Control<TaskFormValues> };

// The form's area of life button, as in the Inbox pane: the task goes in the Inbox until one is picked.
const LifeAreaField = ({ control }: LifeAreaFieldProps) => {
  const {
    field: { value, onChange },
  } = useController({ control, name: "lifeAreaId" });

  return <LifeAreaPicker isCompact lifeAreaId={value} onSave={onChange} />;
};

export default LifeAreaField;
