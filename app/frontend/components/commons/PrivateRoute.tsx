import { Navigate, Outlet } from "react-router";

import { useCurrentUser } from "@/hooks/reactQuery/useSessionsApi";
import routes from "@/routes";

const PrivateRoute = () => {
  const { data: user, isPending } = useCurrentUser();

  if (isPending) return null;

  if (!user) return <Navigate replace to={routes.login} />;

  return <Outlet />;
};

export default PrivateRoute;
