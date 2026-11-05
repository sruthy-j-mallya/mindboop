import { useState } from "react";

import { Outlet } from "react-router";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import AppSidebar from "./AppSidebar";
import { isSidebarOpen, saveSidebarOpen } from "./utils";

const AppLayout = () => {
  const [isOpen, setIsOpen] = useState(isSidebarOpen);

  const handleOpenChange = (nextIsOpen: boolean) => {
    setIsOpen(nextIsOpen);
    saveSidebarOpen(nextIsOpen);
  };

  return (
    <SidebarProvider open={isOpen} onOpenChange={handleOpenChange}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex items-center p-2">
          <SidebarTrigger />
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
