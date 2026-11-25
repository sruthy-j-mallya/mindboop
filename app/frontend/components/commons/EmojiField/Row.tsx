import type { EmojiPickerListRowProps } from "frimousse";

const Row = ({ children, ...props }: EmojiPickerListRowProps) => (
  <div className="scroll-my-1.5 px-1.5" {...props}>
    {children}
  </div>
);

export default Row;
