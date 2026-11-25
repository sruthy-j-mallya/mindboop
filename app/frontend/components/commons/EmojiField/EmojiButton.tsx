import type { EmojiPickerListEmojiProps } from "frimousse";

const EmojiButton = ({ emoji, ...props }: EmojiPickerListEmojiProps) => (
  <button
    className="flex size-8 items-center justify-center rounded-md text-lg data-[active]:bg-accent"
    title={emoji.label}
    {...props}
  >
    {emoji.emoji}
  </button>
);

export default EmojiButton;
