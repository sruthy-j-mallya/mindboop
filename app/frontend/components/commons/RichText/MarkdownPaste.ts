import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Extension } from "@tiptap/react";

// Block syntax at the start of a line: headings, list items, quotes and code fences.
const MARKDOWN_BLOCK = /^\s{0,3}(#{1,6}\s|[-*+]\s|\d+[.)]\s|>|```|~~~)/m;
// Unambiguous inline syntax: bold, strikethrough, inline code and [text](url) links. A lone * or _ is
// left out, since plain text uses those too.
const MARKDOWN_INLINE = [
  /\*\*[^*\n]+\*\*/,
  /__[^_\n]+__/,
  /~~[^~\n]+~~/,
  /`[^`\n]+`/,
  // The "](http" seam of a [text](url) link; matching the whole link would backtrack on unclosed brackets.
  /\]\((?:https?:|mailto:)/,
];

export const looksLikeMarkdown = (text: string) =>
  MARKDOWN_BLOCK.test(text) || MARKDOWN_INLINE.some((pattern) => pattern.test(text));

// The Markdown extension parses stored content but not the clipboard, so pasted Markdown would land as literal
// "## " and "**". When the plain text looks like Markdown, parse it instead of using the clipboard's HTML (which,
// from a code editor, is just the raw text in styled spans). Inside a code block, paste stays literal.
const MarkdownPaste = Extension.create({
  name: "markdownPaste",

  addProseMirrorPlugins() {
    const { editor } = this;

    return [
      new Plugin({
        key: new PluginKey("markdownPaste"),
        props: {
          handlePaste: (_view, event) => {
            const text = event.clipboardData?.getData("text/plain");
            if (!text || !editor.markdown || editor.isActive("codeBlock") || !looksLikeMarkdown(text))
              return false;

            return editor.commands.insertContent(text, { contentType: "markdown" });
          },
        },
      }),
    ];
  },
});

export default MarkdownPaste;
