import { useId } from "react";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { DropTarget } from "../types";
import { getTargetId } from "../utils";

type TargetFieldProps = {
  targets: DropTarget[];
  target: DropTarget;
  isDisabled: boolean;
  onChange: (target: DropTarget) => void;
};

// Picks the list a deleted area's uncompleted tasks move to.
const TargetField = ({ targets, target, isDisabled, onChange }: TargetFieldProps) => {
  const id = useId();

  const handleChange = (targetId: string) => {
    const picked = targets.find((option) => getTargetId(option) === targetId);
    if (picked) onChange(picked);
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>Move tasks to</Label>
      <Select disabled={isDisabled} value={getTargetId(target)} onValueChange={handleChange}>
        <SelectTrigger className="w-full" id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          {targets.map((option) => (
            <SelectItem key={getTargetId(option)} value={getTargetId(option)}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TargetField;
