import { useEffect } from "react";

import { isCaptureShortcut, isSearchShortcut } from "./utils";

type Shortcuts = { onSearch: () => void; onCapture: () => void };

// The app's keyboard shortcuts. Whatever has the focus goes first: the description editor keeps ⌘K for links, and a
// press it has handled is left alone.
const useShortcuts = ({ onSearch, onCapture }: Shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return;

      if (isSearchShortcut(event)) {
        event.preventDefault();
        onSearch();
      } else if (isCaptureShortcut(event)) {
        event.preventDefault();
        onCapture();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSearch, onCapture]);
};

export default useShortcuts;
