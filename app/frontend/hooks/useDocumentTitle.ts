import { useEffect } from "react";

import { APP_NAME } from "@/constants";

// Names the page in the browser's tab. With no title, it's just the app's name.
const useDocumentTitle = (title?: string) => {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
};

export default useDocumentTitle;
