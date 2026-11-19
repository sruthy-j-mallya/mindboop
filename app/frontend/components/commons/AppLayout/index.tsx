import { useState } from "react";

import { Outlet } from "react-router";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import useApplyTheme from "@/hooks/useApplyTheme";

import AppSidebar from "./AppSidebar";
import BreakAlarm from "./BreakAlarm";
import CuriosityAlarm from "./CuriosityAlarm";
import CurrentSession from "./CurrentSession";
import RoutineReminders from "./RoutineReminders";
import { isSidebarOpen, saveSidebarOpen } from "./utils";

const AppLayout = () => {
  const [isOpen, setIsOpen] = useState(isSidebarOpen);
  useApplyTheme();

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
        <BreakAlarm />
        <CuriosityAlarm />
        <Outlet />
      </SidebarInset>
      <CurrentSession />
      <RoutineReminders />
      {/* Bottom centre, clear of the mini timer in the bottom-right corner. */}
      <Toaster position="bottom-center" />
    </SidebarProvider>
  );
};

export default AppLayout;
