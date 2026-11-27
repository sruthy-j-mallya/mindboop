import { cn } from "cn";
import type { ReactNode } from "react";

import { LINK_CLASS_NAME } from "./constants";
import { splitLinks } from "./utils";

type LinkifiedTextProps = {
  text: string;
  linkClassName?: string;
  // Wraps each plain run, as when the rest of the text links somewhere else (links can't nest).
  renderText?: (text: string) => ReactNode;
};

// Text with any web addresses in it as links that open in a new tab. Segments never reorder, so their position (and
// text) makes a stable key.
const LinkifiedText = ({ text, linkClassName, renderText }: LinkifiedTextProps) =>
  splitLinks(text).map((segment, index) => {
    const key = `${index}-${segment.text}`;

    if (segment.kind === "text")
      return <span key={key}>{renderText ? renderText(segment.text) : segment.text}</span>;

    return (
      <a
        key={key}
        className={cn(LINK_CLASS_NAME, linkClassName)}
        href={segment.href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {segment.text}
      </a>
    );
  });

export default LinkifiedText;
