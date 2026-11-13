import { lazy, Suspense } from "react";

// Loads Tiptap in its own chunk, and only when there's a description to show.
const RichTextViewer = lazy(() => import("./Viewer"));

type LazyRichTextViewerProps = { markdown: string };

const LazyRichTextViewer = ({ markdown }: LazyRichTextViewerProps) => (
  // Nothing while it loads: raw Markdown would flash its syntax, and the description sits below the countdown.
  <Suspense fallback={null}>
    <RichTextViewer markdown={markdown} />
  </Suspense>
);

export default LazyRichTextViewer;
