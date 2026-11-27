import { cn } from "cn";
import type { ReactNode } from "react";

import Logo from "./Logo";

type EmptyPaneProps = { message: string; className?: string; children?: ReactNode };

// A pane with nothing in it yet: the mascot, what would be here, and (`children`) what to do about it.
const EmptyPane = ({ message, className, children }: EmptyPaneProps) => (
  <div
    className={cn(
      "flex flex-1 flex-col items-center justify-center gap-4 py-12 text-center text-sm text-muted-foreground",
      className,
    )}
  >
    <Logo alt="" className="size-20" />
    <p>{message}</p>
    {children}
  </div>
);

export default EmptyPane;
