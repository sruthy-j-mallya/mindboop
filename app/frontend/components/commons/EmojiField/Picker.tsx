import { type Emoji, EmojiPicker } from "frimousse";

import CategoryHeader from "./CategoryHeader";
import { EMOJI_COLUMNS } from "./constants";
import EmojiButton from "./EmojiButton";
import Row from "./Row";
import { resolveEmojiData } from "./utils";

type PickerProps = { onPick: (emoji: string) => void };

// The emojis on offer by category, with a search.
const Picker = ({ onPick }: PickerProps) => {
  const handleSelect = ({ emoji }: Emoji) => onPick(emoji);

  return (
    <EmojiPicker.Root
      className="isolate flex h-80 w-fit flex-col"
      columns={EMOJI_COLUMNS}
      resolveEmojiData={resolveEmojiData}
      onEmojiSelect={handleSelect}
    >
      <EmojiPicker.Search
        autoFocus
        aria-label="Search emojis"
        className="m-2 rounded-md bg-muted px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        placeholder="Search emojis"
      />
      <EmojiPicker.Viewport className="relative min-h-0 w-67 flex-1 outline-none">
        <EmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          No emojis found
        </EmojiPicker.Empty>
        <EmojiPicker.List
          className="pb-1.5 select-none"
          components={{ CategoryHeader, Row, Emoji: EmojiButton }}
        />
      </EmojiPicker.Viewport>
    </EmojiPicker.Root>
  );
};

export default Picker;
