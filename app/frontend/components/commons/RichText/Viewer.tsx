import { EditorContent, useEditor } from "@tiptap/react";

import { getExtensions } from "./utils";

type RichTextViewerProps = { markdown: string };

const EXTENSIONS = getExtensions();

// Renders stored Markdown through the editor's own schema, so nothing outside it (such as raw HTML) reaches the page.
const RichTextViewer = ({ markdown }: RichTextViewerProps) => {
  const editor = useEditor(
    {
      extensions: EXTENSIONS,
      editable: false,
      content: markdown,
      contentType: "markdown",
      editorProps: { attributes: { class: "rich-text" } },
    },
    [markdown],
  );

  return <EditorContent editor={editor} />;
};

export default RichTextViewer;
