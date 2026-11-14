import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// jsdom has no matchMedia; the shadcn sidebar needs it to detect mobile widths.
vi.stubGlobal("matchMedia", (query: string) => ({
  matches: false,
  media: query,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));

// jsdom has no ResizeObserver; the Radix checkbox needs it to size its hidden input.
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  },
);

// jsdom has no pointer capture; Sonner captures the pointer on any press inside a toast, for swipe-to-dismiss.
Element.prototype.setPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();

// jsdom does no layout; ProseMirror (the rich-text editor) measures ranges and elements to place the caret.
const emptyRectList = () => Object.assign([], { item: () => null }) as unknown as DOMRectList;
const emptyRect = () => new DOMRect();
Range.prototype.getClientRects = emptyRectList;
Range.prototype.getBoundingClientRect = emptyRect;
Element.prototype.getClientRects = emptyRectList;
document.elementFromPoint = () => null;

afterEach(() => cleanup());
