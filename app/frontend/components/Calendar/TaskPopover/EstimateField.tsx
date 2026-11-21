import { Hourglass } from "lucide-react";
import { type Control, useController } from "react-hook-form";

import EstimatePicker from "@/components/commons/EstimatePicker";
import { Button } from "@/components/ui/button";
import { formatMinutes } from "@/utils";

import type { TaskFormValues } from "./constants";

type EstimateFieldProps = { control: Control<TaskFormValues> };

// The form's estimate button: the estimate once set, "Estimate" until then, as in the Inbox pane.
const EstimateField = ({ control }: EstimateFieldProps) => {
  const {
    field: { value, onChange },
  } = useController({ control, name: "estimatedMinutes" });

  return (
    <EstimatePicker estimatedMinutes={value} onSave={onChange}>
      <Button className="text-muted-foreground" size="sm" type="button" variant="ghost">
        <Hourglass />
        {value ? formatMinutes(value) : "Estimate"}
      </Button>
    </EstimatePicker>
  );
};

export default EstimateField;
