import { zodResolver } from "@hookform/resolvers/zod";
import type { Editor } from "@tiptap/react";
import { Link } from "lucide-react";
import type { FormEvent } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { LINK_SHORTCUT, LINK_VALIDATION_SCHEMA, type LinkFormValues } from "./constants";
import { formatShortcut, normalizeLinkUrl } from "./utils";

type LinkPopoverProps = {
  editor: Editor;
  isActive: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const LinkPopover = ({ editor, isActive, isOpen, onOpenChange }: LinkPopoverProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LinkFormValues>({ resolver: zodResolver(LINK_VALIDATION_SCHEMA) });

  const handleOpenChange = (isOpening: boolean) => {
    if (isOpening) reset({ url: editor.getAttributes("link").href ?? "" });

    onOpenChange(isOpening);
  };

  const handleToggle = () => handleOpenChange(!isOpen);

  const handleApply = ({ url }: LinkFormValues) => {
    const href = normalizeLinkUrl(url);
    const chain = editor.chain().focus().extendMarkRange("link");

    // With nothing selected there's no text to turn into a link, so insert the address itself.
    if (editor.state.selection.empty && !isActive) {
      chain.insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] }).run();
    } else {
      chain.setLink({ href }).run();
    }
    onOpenChange(false);
  };

  // The popover is portalled, but React still bubbles its submit to the surrounding task form.
  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.stopPropagation();
    void handleSubmit(handleApply)(event);
  };

  const handleRemove = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    onOpenChange(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <Tooltip>
        <PopoverAnchor asChild>
          <TooltipTrigger asChild>
            <Toggle aria-label="Link" pressed={isActive} size="sm" onPressedChange={handleToggle}>
              <Link />
            </Toggle>
          </TooltipTrigger>
        </PopoverAnchor>
        <TooltipContent>
          Link <kbd className="ml-1 font-sans opacity-70">{formatShortcut(LINK_SHORTCUT)}</kbd>
        </TooltipContent>
      </Tooltip>
      <PopoverContent align="start" className="w-80">
        <form noValidate className="grid gap-2" onSubmit={handleFormSubmit}>
          <Input
            aria-describedby={errors.url ? "link-url-error" : undefined}
            aria-invalid={!!errors.url}
            aria-label="Link address"
            autoComplete="off"
            placeholder="https://example.com"
            {...register("url")}
          />
          {errors.url && (
            <p className="text-sm text-destructive" id="link-url-error">
              {errors.url.message}
            </p>
          )}
          <div className="flex justify-end gap-2">
            {isActive && (
              <Button size="sm" type="button" variant="ghost" onClick={handleRemove}>
                Remove link
              </Button>
            )}
            <Button size="sm" type="submit">
              Apply
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default LinkPopover;
