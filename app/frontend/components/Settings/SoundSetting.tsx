import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SoundSettingProps<Id extends string> = {
  id: string;
  label: string;
  description: string;
  options: { id: Id; label: string }[];
  value: Id;
  isPreviewDisabled?: boolean;
  onChange: (value: Id) => void;
  onPreview: () => void;
};

const SoundSetting = <Id extends string>({
  id,
  label,
  description,
  options,
  value,
  isPreviewDisabled = false,
  onChange,
  onPreview,
}: SoundSettingProps<Id>) => (
  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
    <div className="flex min-w-0 flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      <span className="text-sm text-muted-foreground">{description}</span>
    </div>
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-48" id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        aria-label={`Play ${label.toLowerCase()} sound`}
        className="rounded-full"
        disabled={isPreviewDisabled}
        size="icon"
        type="button"
        variant="ghost"
        onClick={onPreview}
      >
        <Play />
      </Button>
    </div>
  </div>
);

export default SoundSetting;
