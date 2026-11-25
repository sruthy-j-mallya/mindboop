import { useCallback, useState } from "react";

import { Outlet } from "react-router";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import useApplyTheme from "@/hooks/useApplyTheme";

import AppSidebar from "./AppSidebar";
import BottomBar from "./BottomBar";
import BreakAlarm from "./BreakAlarm";
import { TOAST_MOBILE_OFFSET } from "./constants";
import CuriosityAlarm from "./CuriosityAlarm";
import CurrentSession from "./CurrentSession";
import GlobalSearch from "./GlobalSearch";
import PageTitle from "./PageTitle";
import QuickCapture from "./QuickCapture";
import RoutineReminders from "./RoutineReminders";
import useShortcuts from "./useShortcuts";
import { isSidebarOpen, saveSidebarOpen } from "./utils";

const AppLayout = () => {
  const [isOpen, setIsOpen] = useState(isSidebarOpen);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  useApplyTheme();

  const handleOpenChange = (nextIsOpen: boolean) => {
    setIsOpen(nextIsOpen);
    saveSidebarOpen(nextIsOpen);
  };

  const handleSearchOpen = useCallback(() => setIsSearchOpen(true), []);
  const handleCaptureOpen = useCallback(() => setIsCaptureOpen(true), []);
  useShortcuts({ onSearch: handleSearchOpen, onCapture: handleCaptureOpen });

  return (
    <SidebarProvider open={isOpen} onOpenChange={handleOpenChange}>
      <AppSidebar onCaptureOpen={handleCaptureOpen} onSearchOpen={handleSearchOpen} />
      {/* On phones, clear of the bottom bar, and of the mini timer above it while there is one. */}
      <SidebarInset className="max-md:pb-(--bottom-bar-height) max-md:group-has-data-mini-timer/sidebar-wrapper:pb-[calc(var(--bottom-bar-height)+4.5rem)]">
        {/* On phones the bottom bar leads to the sidebar instead. */}
        <header className="flex items-center p-2">
          <SidebarTrigger className="max-md:hidden" />
        </header>
        <BreakAlarm />
        <CuriosityAlarm />
        <Outlet />
      </SidebarInset>
      <BottomBar />
      <PageTitle />
      <CurrentSession />
      <RoutineReminders />
      {/* Outside the sidebar, which unmounts its content on narrow screens when it closes. */}
      <QuickCapture isOpen={isCaptureOpen} onOpenChange={setIsCaptureOpen} />
      <GlobalSearch isOpen={isSearchOpen} onOpenChange={setIsSearchOpen} />
      {/* Bottom centre, clear of the mini timer in the bottom-right corner. */}
      <Toaster mobileOffset={{ bottom: TOAST_MOBILE_OFFSET }} position="bottom-center" />
    </SidebarProvider>
  );
};

export default AppLayout;
