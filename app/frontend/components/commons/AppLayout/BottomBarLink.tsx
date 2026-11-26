import { cn } from "cn";
import type { ReactNode } from "react";
import { Link } from "react-router";

import { BOTTOM_BAR_ITEM_CLASS_NAME } from "./constants";

type BottomBarLinkProps = { path: string; isActive: boolean; icon: ReactNode; children: ReactNode };

const BottomBarLink = ({ path, isActive, icon, children }: BottomBarLinkProps) => (
  <Link
    aria-current={isActive ? "page" : undefined}
    className={cn(BOTTOM_BAR_ITEM_CLASS_NAME, isActive && "font-medium text-primary")}
    to={path}
  >
    {icon}
    <span className="max-w-full truncate">{children}</span>
  </Link>
);

export default BottomBarLink;
