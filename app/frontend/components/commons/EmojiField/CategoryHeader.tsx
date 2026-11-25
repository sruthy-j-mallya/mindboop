import type { EmojiPickerListCategoryHeaderProps } from "frimousse";

const CategoryHeader = ({ category, ...props }: EmojiPickerListCategoryHeaderProps) => (
  <div className="bg-popover px-3 pt-3 pb-1.5 text-xs font-medium text-muted-foreground" {...props}>
    {category.label}
  </div>
);

export default CategoryHeader;
