import type { ComponentProps } from "react";
import { cn } from "cn";
import logoUrl from "@/images/logo.png";

export function Logo({ className, ...props }: ComponentProps<"img">) {
  return <img src={logoUrl} alt="Mindboop" className={cn("size-16", className)} {...props} />;
}
