import { type FormEvent, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Editor } from "@tiptap/react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { LINK_VALIDATION_SCHEMA, type LinkFormValues } from "./constants";
import { getLinkFormValues, getLinkTargetRange, normalizeLinkUrl } from "./utils";

type LinkFormProps = {
  editor: Editor;
  onDone: () => void;
};

// Mounted each time the popover opens, so it starts from whatever link or text is under the cursor right now.
const LinkForm = ({ editor, onDone }: LinkFormProps) => {
  // Read from the editor rather than the toolbar's state, which can lag a click by a render.
  const [isEditingLink] = useState(() => editor.isActive("link"));
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(LINK_VALIDATION_SCHEMA),
    defaultValues: getLinkFormValues(editor, isEditingLink),
  });

  const handleApply = ({ text, url }: LinkFormValues) => {
    const href = normalizeLinkUrl(url);
    const range = getLinkTargetRange(editor, isEditingLink);
    const label = text.trim() || href;
    const chain = editor.chain().focus();

    // Unchanged text is only re-linked, so formatting inside it (bold, code) survives.
    if (label === editor.state.doc.textBetween(range.from, range.to, " ")) {
      chain.setTextSelection(range).setLink({ href }).run();
    } else {
      chain
        .insertContentAt(range, { type: "text", text: label, marks: [{ type: "link", attrs: { href } }] })
        .run();
    }
    onDone();
  };

  // The popover is portalled, but React still bubbles its submit to the surrounding task form.
  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.stopPropagation();
    void handleSubmit(handleApply)(event);
  };

  const handleRemove = () => {
    editor.chain().focus().setTextSelection(getLinkTargetRange(editor, isEditingLink)).unsetLink().run();
    onDone();
  };

  return (
    <form noValidate className="grid gap-2" onSubmit={handleFormSubmit}>
      <Input aria-label="Link text" autoComplete="off" placeholder="Text" {...register("text")} />
      <Input
        aria-describedby={errors.url ? "link-url-error" : undefined}
        aria-invalid={!!errors.url}
        // The address is what's usually being filled in, so it takes focus even though the text comes first.
        autoFocus
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
        {isEditingLink && (
          <Button size="sm" type="button" variant="ghost" onClick={handleRemove}>
            Remove link
          </Button>
        )}
        <Button size="sm" type="submit">
          Apply
        </Button>
      </div>
    </form>
  );
};

export default LinkForm;
