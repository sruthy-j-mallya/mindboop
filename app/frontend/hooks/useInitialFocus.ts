import { useRef } from "react";

// Focuses an element other than the first one when a dialog opens: pass `ref` to the element, and `handleOpenAutoFocus`
// to the dialog's content. Unlike `autoFocus`, the dialog still gives the focus back when it closes.
const useInitialFocus = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);

  const handleOpenAutoFocus = (event: Event) => {
    if (!ref.current) return;

    event.preventDefault();
    ref.current.focus();
  };

  return { ref, handleOpenAutoFocus };
};

export default useInitialFocus;
