import { cn } from "cn";
import { CalendarDays, House, Menu, SquareCheckBig, Timer } from "lucide-react";
import { Link, useLocation } from "react-router";

import { useSidebar } from "@/components/ui/sidebar";
import routes from "@/routes";

import { findBottomBarPath } from "./utils";

const LINKS = [
  { path: routes.root, label: "Home", icon: House },
  { path: routes.inbox.index, label: "Tasks", icon: SquareCheckBig },
  { path: routes.timer, label: "Timer", icon: Timer },
  { path: routes.calendar, label: "Calendar", icon: CalendarDays },
];

const ITEM_CLASS_NAME =
  "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset";

// The main pages within a thumb's reach on phones, where the sidebar is tucked away. More opens the sidebar, for the
// rest.
const BottomBar = () => {
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const activePath = findBottomBarPath(pathname);

  const handleMore = () => setOpenMobile(true);

  if (!isMobile) return null;

  return (
    <nav
      aria-label="Main pages"
      className="fixed inset-x-0 bottom-0 z-40 flex h-(--bottom-bar-height) border-t bg-background"
    >
      {LINKS.map(({ path, label, icon: Icon }) => {
        const isActive = path === activePath;

        return (
          <Link
            key={path}
            aria-current={isActive ? "page" : undefined}
            className={cn(ITEM_CLASS_NAME, isActive && "font-medium text-primary")}
            to={path}
          >
            <Icon aria-hidden className="size-5" />
            {label}
          </Link>
        );
      })}
      <button
        aria-haspopup="dialog"
        className={cn(ITEM_CLASS_NAME, !activePath && "font-medium text-primary")}
        type="button"
        onClick={handleMore}
      >
        <Menu aria-hidden className="size-5" />
        More
      </button>
    </nav>
  );
};

export default BottomBar;
