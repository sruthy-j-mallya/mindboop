import { useState } from "react";

export type OpenStateProps = {
  // Set both to open and close it from outside; otherwise it keeps its own state.
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

// Whether a popover is open, kept here unless the caller controls it.
const useOpenState = ({ isOpen, onOpenChange }: OpenStateProps) => {
  const [isOpenInside, setIsOpenInside] = useState(false);

  const setIsOpen = (isOpening: boolean) => {
    setIsOpenInside(isOpening);
    onOpenChange?.(isOpening);
  };

  return [isOpen ?? isOpenInside, setIsOpen] as const;
};

export default useOpenState;
