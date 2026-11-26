import {
  CalendarDays,
  CirclePlus,
  House,
  Search,
  Settings,
  SquareCheckBig,
  SunMoon,
  Timer,
} from "lucide-react";
import { Link, useLocation, useMatch } from "react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useParkingLotItems } from "@/hooks/reactQuery/useParkingLotItemsApi";
import routes from "@/routes";

import { CAPTURE_SHORTCUT_LABEL, SEARCH_SHORTCUT_LABEL } from "./constants";
import ParkingLotIcon from "./ParkingLotIcon";
import { isTasksPath } from "./utils";

type AppSidebarProps = { onSearchOpen: () => void; onCaptureOpen: () => void };

const AppSidebar = ({ onSearchOpen, onCaptureOpen }: AppSidebarProps) => {
  const { pathname } = useLocation();
  const { setOpenMobile } = useSidebar();
  const { data: parkedItems } = useParkingLotItems({ status: "parked" });
  const parkedCount = parkedItems?.parkingLotItemsCount ?? 0;

  const handleNavigate = () => setOpenMobile(false);

  const handleSearch = () => {
    setOpenMobile(false);
    onSearchOpen();
  };

  const handleCapture = () => {
    setOpenMobile(false);
    onCaptureOpen();
  };

  const isRoutinesActive = !!useMatch({ path: routes.routines.index, end: false });

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton aria-haspopup="dialog" tooltip="Search" onClick={handleSearch}>
                  <Search />
                  <span>Search</span>
                  <kbd aria-hidden className="ml-auto text-xs text-muted-foreground">
                    {SEARCH_SHORTCUT_LABEL}
                  </kbd>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton aria-haspopup="dialog" tooltip="New task" onClick={handleCapture}>
                  <CirclePlus />
                  <span>New task</span>
                  <kbd aria-hidden className="ml-auto text-xs text-muted-foreground">
                    {CAPTURE_SHORTCUT_LABEL}
                  </kbd>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === routes.root} tooltip="Home">
                  <Link to={routes.root} onClick={handleNavigate}>
                    <House />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isTasksPath(pathname)} tooltip="Tasks">
                  <Link to={routes.inbox.index} onClick={handleNavigate}>
                    <SquareCheckBig />
                    <span>Tasks</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === routes.calendar} tooltip="Calendar">
                  <Link to={routes.calendar} onClick={handleNavigate}>
                    <CalendarDays />
                    <span>Calendar</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isRoutinesActive} tooltip="Routines">
                  <Link to={routes.routines.index} onClick={handleNavigate}>
                    <SunMoon />
                    <span>Routines</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === routes.timer} tooltip="Timer">
                  <Link to={routes.timer} onClick={handleNavigate}>
                    <Timer />
                    <span>Timer</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === routes.parkingLot} tooltip="Parking lot">
                  <Link to={routes.parkingLot} onClick={handleNavigate}>
                    <ParkingLotIcon count={parkedCount} />
                    <span>
                      Parking lot
                      {parkedCount > 0 && (
                        <>
                          {" "}
                          <span className="sr-only">({parkedCount} parked)</span>
                        </>
                      )}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === routes.settings} tooltip="Settings">
              <Link to={routes.settings} onClick={handleNavigate}>
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
