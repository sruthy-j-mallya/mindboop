import { Boxes, CalendarDays, LogOut, Settings, SquareParking, SunMoon, Timer, Zap } from "lucide-react";
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
import { useLogout } from "@/hooks/reactQuery/useSessionsApi";
import routes from "@/routes";

const AppSidebar = () => {
  const { pathname } = useLocation();
  const { setOpenMobile } = useSidebar();
  const { mutate: logout, isPending } = useLogout();

  const handleLogout = () => logout();
  const handleNavigate = () => setOpenMobile(false);
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
                <SidebarMenuButton asChild isActive={pathname === routes.root} tooltip="Quick start">
                  <Link to={routes.root} onClick={handleNavigate}>
                    <Zap />
                    <span>Quick start</span>
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
                    <SquareParking />
                    <span>Parking lot</span>
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
