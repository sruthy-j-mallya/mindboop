import { Boxes, CalendarDays, House, LogOut, Search, Settings, SunMoon, Timer } from "lucide-react";
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
import { useLogout } from "@/hooks/reactQuery/useSessionsApi";
import routes from "@/routes";

import ParkingLotIcon from "./ParkingLotIcon";

type AppSidebarProps = { onSearchOpen: () => void };

const AppSidebar = ({ onSearchOpen }: AppSidebarProps) => {
  const { pathname } = useLocation();
  const { setOpenMobile } = useSidebar();
  const { mutate: logout, isPending } = useLogout();
  const { data: parkedItems } = useParkingLotItems({ status: "parked" });
  const parkedCount = parkedItems?.parkingLotItemsCount ?? 0;

  const handleLogout = () => logout();
  const handleNavigate = () => setOpenMobile(false);

  const handleSearch = () => {
    setOpenMobile(false);
    onSearchOpen();
  };

  // The areas of life and the Inbox share one page, with a sidebar of their own to switch between them.
  const isInboxActive = !!useMatch({ path: routes.inbox.index, end: false });
  const isLifeAreaActive = !!useMatch({ path: routes.lifeAreas.index, end: false });
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
                <SidebarMenuButton
                  asChild
                  isActive={isInboxActive || isLifeAreaActive}
                  tooltip="Areas of life"
                >
                  <Link to={routes.inbox.index} onClick={handleNavigate}>
                    <Boxes />
                    <span>Areas of life</span>
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
          <SidebarMenuItem>
            <SidebarMenuButton disabled={isPending} tooltip="Sign out" onClick={handleLogout}>
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
