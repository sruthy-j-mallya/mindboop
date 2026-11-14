import { cn } from "cn";
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

import { buttonVariants } from "@/components/ui/button";

// Sonner's own styling is turned off (`unstyled`) so toasts use the design tokens: a popover surface with the app's
// border, radius and shadow, and buttons from `buttonVariants` rather than Sonner's black ones. The tokens follow the
// `.dark` class, so there's no theme to pass (the app has no next-themes).
const Toaster = ({ toastOptions, ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group font-sans"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        unstyled: true,
        ...toastOptions,
        classNames: {
          toast:
            "flex w-(--width) items-center gap-3 rounded-xl border border-border bg-popover py-2 pr-2 pl-4 text-sm text-popover-foreground shadow-lg max-sm:w-full",
          content: "flex min-w-0 flex-1 flex-col gap-0.5 py-1.5",
          title: "font-medium wrap-anywhere",
          description: "text-muted-foreground",
          icon: "flex size-4 shrink-0 items-center",
          error: "[&_[data-icon]]:text-destructive",
          success: "[&_[data-icon]]:text-primary",
          // Inbox's undo action is an icon (with a screen-reader label), so it takes the icon button size.
          actionButton: cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "shrink-0 text-primary"),
          cancelButton: cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "shrink-0 text-muted-foreground",
          ),
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
