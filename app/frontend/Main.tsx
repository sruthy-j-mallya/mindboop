import { Route, Routes } from "react-router";

import PrivateRoute from "@/components/commons/PrivateRoute";
import ForgotPassword from "@/components/ForgotPassword";
import Home from "@/components/Home";
import Login from "@/components/Login";
import ResetPassword from "@/components/ResetPassword";
import Signup from "@/components/Signup";
import routes from "@/routes";

const Main = () => (
  <Routes>
    <Route element={<PrivateRoute />}>
      <Route element={<Home />} path={routes.root} />
    </Route>
    <Route element={<Login />} path={routes.login} />
    <Route element={<Signup />} path={routes.signup} />
    <Route element={<ForgotPassword />} path={routes.passwords.new} />
    <Route element={<ResetPassword />} path={routes.passwords.edit} />
  </Routes>
);

export default Main;
