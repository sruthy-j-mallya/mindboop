import { Outlet } from "react-router";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import AppSidebar from "./AppSidebar";
import { isSidebarOpen } from "./utils";

const AppLayout = () => (
  <SidebarProvider defaultOpen={isSidebarOpen()}>
    <AppSidebar />
    <SidebarInset>
      <header className="flex items-center p-2">
        <SidebarTrigger />
      </header>
      <Outlet />
    </SidebarInset>
  </SidebarProvider>
);

export default AppLayout;
