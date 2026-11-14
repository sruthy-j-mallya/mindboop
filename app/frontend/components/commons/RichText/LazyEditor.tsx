import { lazy, Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import type { RichTextEditorProps } from "./types";

// Tiptap is ~150 kB gzipped, so it loads in its own chunk the first time an editor is shown.
const RichTextEditor = lazy(() => import("./Editor"));

// Same footprint as the editor (its toolbar starts hidden), so the form doesn't jump when it loads.
const EditorPlaceholder = () => (
  <div
    aria-busy="true"
    aria-label="Loading editor"
    className="rounded-md border border-input shadow-xs"
    role="status"
  >
    <div className="grid min-h-28 content-start gap-2 px-3 py-3">
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
);

const LazyRichTextEditor = (props: RichTextEditorProps) => (
  <Suspense fallback={<EditorPlaceholder />}>
    <RichTextEditor {...props} />
  </Suspense>
);

export default LazyRichTextEditor;
