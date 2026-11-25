import { useState } from "react";

import type { ControllerRenderProps } from "react-hook-form";

import type { LifeAreaColorId } from "@/components/commons/LifeArea/types";
import { toAreaColorStyle } from "@/components/commons/LifeArea/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import Picker from "./Picker";
import { getEmojiLabel } from "./utils";

type EmojiFieldProps = {
  // The form's `useController` field for its emoji.
  field: Pick<ControllerRenderProps<{ emoji: string }, "emoji">, "value" | "onChange" | "onBlur" | "ref">;
  color: LifeAreaColorId;
  error?: string;
};

// The form's emoji on the colour picked, opening a picker of the emojis on offer. The popover is modal so its list can
// scroll inside the dialog.
const EmojiField = ({ field: { value, onChange, onBlur, ref }, color, error }: EmojiFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePick = (emoji: string) => {
    onChange(emoji);
    setIsOpen(false);
  };

  return (
    <div className="grid justify-items-start gap-2">
      <span aria-hidden className="text-sm font-medium">
        Emoji
      </span>
      <Popover modal open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          ref={ref}
          aria-label={`Emoji: ${getEmojiLabel(value) ?? value}`}
          className="area-tint flex size-11 items-center justify-center rounded-lg text-2xl leading-none transition-[filter] outline-none hover:brightness-95 focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:hover:brightness-125"
          style={toAreaColorStyle(color)}
          type="button"
          onBlur={onBlur}
        >
          {value}
        </PopoverTrigger>
        <PopoverContent align="start" aria-label="Pick an emoji" className="w-fit p-0">
          <Picker onPick={handlePick} />
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default EmojiField;
