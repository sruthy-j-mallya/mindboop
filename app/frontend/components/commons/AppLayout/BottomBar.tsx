import { cn } from "cn";
import { CalendarDays, House, Menu, SunMoon } from "lucide-react";
import { useLocation } from "react-router";

import { useSidebar } from "@/components/ui/sidebar";
import { useParkingLotItems } from "@/hooks/reactQuery/useParkingLotItemsApi";
import routes from "@/routes";

import BottomBarLink from "./BottomBarLink";
import { BOTTOM_BAR_ITEM_CLASS_NAME } from "./constants";
import ParkingLotIcon from "./ParkingLotIcon";
import { findBottomBarPath } from "./utils";

const LINKS = [
  { path: routes.root, label: "Home", icon: House },
  { path: routes.calendar, label: "Calendar", icon: CalendarDays },
  { path: routes.routines.index, label: "Routines", icon: SunMoon },
];

// What's needed on the go, within a thumb's reach on phones, where the sidebar is tucked away. The lists of tasks and
// the timer, reached from Home and the mini timer, are under More with the rest; More opens the sidebar.
const BottomBar = () => {
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const { data: parkedItems } = useParkingLotItems({ status: "parked" });
  const parkedCount = parkedItems?.parkingLotItemsCount ?? 0;
  const activePath = findBottomBarPath(pathname);

  const handleMore = () => setOpenMobile(true);

  if (!isMobile) return null;

  return (
    <nav
      aria-label="Main pages"
      className="fixed inset-x-0 bottom-0 z-40 flex h-(--bottom-bar-height) border-t bg-background"
    >
      {LINKS.map(({ path, label, icon: Icon }) => (
        <BottomBarLink
          key={path}
          icon={<Icon aria-hidden className="size-5" />}
          isActive={path === activePath}
          path={path}
        >
          {label}
        </BottomBarLink>
      ))}
      <BottomBarLink
        icon={<ParkingLotIcon className="size-5" count={parkedCount} />}
        isActive={activePath === routes.parkingLot}
        path={routes.parkingLot}
      >
        Parking lot
        {parkedCount > 0 && (
          <>
            {" "}
            <span className="sr-only">({parkedCount} parked)</span>
          </>
        )}
      </BottomBarLink>
      <button
        aria-haspopup="dialog"
        className={cn(BOTTOM_BAR_ITEM_CLASS_NAME, !activePath && "font-medium text-primary")}
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
