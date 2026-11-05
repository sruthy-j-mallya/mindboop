import { SIDEBAR_STORAGE_KEY } from "./constants";

export const isSidebarOpen = () => {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  } catch {
    // Storage can be blocked; the sidebar starts collapsed.
    return false;
  }
};

export const saveSidebarOpen = (isOpen: boolean) => {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isOpen));
  } catch {
    // Storage can be blocked; the sidebar still toggles until the next reload.
  }
};
