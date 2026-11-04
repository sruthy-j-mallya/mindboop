import { SIDEBAR_COOKIE_NAME } from "./constants";

export const isSidebarOpen = () => document.cookie.split("; ").includes(`${SIDEBAR_COOKIE_NAME}=true`);
