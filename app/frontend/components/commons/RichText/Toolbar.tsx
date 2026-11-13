import { Fragment, type MouseEvent } from "react";

import { type Editor, useEditorState } from "@tiptap/react";

import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";

import { FORMAT_GROUPS, FORMAT_ITEMS } from "./constants";
import FormatButton from "./FormatButton";
import LinkButton from "./LinkButton";
import type { FormatStates } from "./types";

type ToolbarProps = {
  editor: Editor;
  onLinkClick: () => void;
};

const Toolbar = ({ editor, onLinkClick }: ToolbarProps) => {
  // Only re-renders the toolbar when a button's pressed state actually changes, not on every keystroke.
  const formatStates = useEditorState({
    editor,
    selector: ({ editor: current }): FormatStates => ({
      ...(Object.fromEntries(FORMAT_ITEMS.map(({ name, isActive }) => [name, isActive(current)])) as Omit<
        FormatStates,
        "link"
      >),
      link: current.isActive("link"),
    }),
  });

  // Keeps the editor focused, with its selection intact, when a button is clicked. React also bubbles mousedowns
  // from the portalled link popover through here, and those must still be able to focus its fields.
  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.target as Node)) event.preventDefault();
  };

  return (
    <TooltipProvider>
      <div
        aria-label="Formatting"
        // Room on the right for the formatting toggle, which sits in the editor's bottom-right corner. min-h-10
        // matches the editor's pb-10 while the toolbar is hidden, so toggling it doesn't shift the layout.
        className="flex min-h-10 flex-wrap items-center gap-0.5 border-t border-input py-0.5 pr-10 pl-1"
        role="toolbar"
        onMouseDown={handleMouseDown}
      >
        {FORMAT_GROUPS.map((group, index) => (
          <Fragment key={group[0].name}>
            {index > 0 && <Separator className="mx-1 h-5!" orientation="vertical" />}
            {group.map((item) => (
              <FormatButton key={item.name} editor={editor} isActive={formatStates[item.name]} item={item} />
            ))}
          </Fragment>
        ))}
        <Separator className="mx-1 h-5!" orientation="vertical" />
        <LinkButton isActive={formatStates.link} onClick={onLinkClick} />
      </div>
    </TooltipProvider>
  );
};

export default Toolbar;
