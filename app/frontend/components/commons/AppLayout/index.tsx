import { useState } from "react";

import { Outlet } from "react-router";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import useApplyTheme from "@/hooks/useApplyTheme";

import AppSidebar from "./AppSidebar";
import BreakAlarm from "./BreakAlarm";
import CuriosityAlarm from "./CuriosityAlarm";
import CurrentSession from "./CurrentSession";
import GlobalSearch from "./GlobalSearch";
import PageTitle from "./PageTitle";
import RoutineReminders from "./RoutineReminders";
import { isSidebarOpen, saveSidebarOpen } from "./utils";

const AppLayout = () => {
  const [isOpen, setIsOpen] = useState(isSidebarOpen);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  useApplyTheme();

  const handleOpenChange = (nextIsOpen: boolean) => {
    setIsOpen(nextIsOpen);
    saveSidebarOpen(nextIsOpen);
  };

  const handleSearchOpen = () => setIsSearchOpen(true);

  return (
    <SidebarProvider open={isOpen} onOpenChange={handleOpenChange}>
      <AppSidebar onSearchOpen={handleSearchOpen} />
      <SidebarInset>
        <header className="flex items-center p-2">
          <SidebarTrigger />
        </header>
        <BreakAlarm />
        <CuriosityAlarm />
        <Outlet />
      </SidebarInset>
      <PageTitle />
      <CurrentSession />
      <RoutineReminders />
      {/* Outside the sidebar, which unmounts its content on narrow screens when it closes. */}
      <GlobalSearch isOpen={isSearchOpen} onOpenChange={setIsSearchOpen} />
      {/* Bottom centre, clear of the mini timer in the bottom-right corner. */}
      <Toaster position="bottom-center" />
    </SidebarProvider>
  );
};

export default AppLayout;
