import { Link } from "react-router";

import Logo from "@/components/commons/Logo";
import { Button } from "@/components/ui/button";
import routes from "@/routes";

// Shown in the layout for a path that leads nowhere, so the sidebar is still there.
const NotFound = () => (
  <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
    <Logo alt="" className="size-24" />
    <div className="grid gap-1">
      <h1 className="text-2xl font-semibold">This page isn’t here</h1>
      <p className="text-muted-foreground">The link may be old or mistyped.</p>
    </div>
    <Button asChild size="lg">
      <Link to={routes.root}>Go to Home</Link>
    </Button>
  </div>
);

export default NotFound;
