import { cn } from "cn";
import { Ellipsis, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type EditDeleteMenuProps = {
  name: string;
  className?: string;
  onEdit: () => void;
  onDelete: () => void;
};

// A row's Edit and Delete, as its right-click menu has. With a mouse it shows while the row (a `group`) is hovered or
// has focus; touch screens can't hover, so it always shows there.
const EditDeleteMenu = ({ name, className, onEdit, onDelete }: EditDeleteMenuProps) => (
  <DropdownMenu modal={false}>
    <DropdownMenuTrigger asChild>
      <Button
        aria-label={`Options for ${name}`}
        className={cn(
          "shrink-0 text-muted-foreground group-focus-within:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100 pointer-fine:opacity-0",
          className,
        )}
        size="icon-xs"
        type="button"
        variant="ghost"
      >
        <Ellipsis />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-40">
      <DropdownMenuItem onSelect={onEdit}>
        <Pencil />
        Edit
      </DropdownMenuItem>
      <DropdownMenuItem variant="destructive" onSelect={onDelete}>
        <Trash2 />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default EditDeleteMenu;
