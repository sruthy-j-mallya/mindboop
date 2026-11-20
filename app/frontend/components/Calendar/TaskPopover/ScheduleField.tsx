import { CalendarDays } from "lucide-react";
import { type Control, useController } from "react-hook-form";

import ScheduleLabel from "@/components/commons/ScheduleLabel";
import SchedulePicker from "@/components/commons/SchedulePicker";
import type { SchedulePayload } from "@/components/commons/SchedulePicker/types";
import { Button } from "@/components/ui/button";

import type { TaskFormValues } from "./constants";
import { toSchedule } from "./utils";

type ScheduleFieldProps = { control: Control<TaskFormValues> };

// The form's schedule button: the date once set, "Due date" until then, as in the Inbox pane.
const ScheduleField = ({ control }: ScheduleFieldProps) => {
  const {
    field: { value, onChange },
  } = useController({ control, name: "schedule" });

  const handleSave = (schedule: SchedulePayload) => onChange(toSchedule(schedule));

  return (
    <SchedulePicker schedule={value} onSave={handleSave}>
      <Button className="text-muted-foreground" size="sm" type="button" variant="ghost">
        <CalendarDays />
        {value.startsAt ? <ScheduleLabel schedule={value} /> : "Due date"}
      </Button>
    </SchedulePicker>
  );
};

export default ScheduleField;
