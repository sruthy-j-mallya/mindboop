import { cn } from "cn";
import type { ComponentProps } from "react";

import logoUrl from "@/images/logo.png";

const Logo = ({ className, ...props }: ComponentProps<"img">) => (
  <img src={logoUrl} alt="Mindboop" className={cn("size-16", className)} {...props} />
);

export default Logo;
