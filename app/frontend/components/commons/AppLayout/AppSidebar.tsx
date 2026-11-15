import { Inbox, LogOut, Settings, Timer, Zap } from "lucide-react";
import { Link, useLocation } from "react-router";

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
                <SidebarMenuButton asChild isActive={pathname.startsWith(routes.inbox.index)} tooltip="Inbox">
                  <Link to={routes.inbox.index} onClick={handleNavigate}>
                    <Inbox />
                    <span>Inbox</span>
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
