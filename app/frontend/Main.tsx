import { Route, Routes } from "react-router";

import AppLayout from "@/components/commons/AppLayout";
import PrivateRoute from "@/components/commons/PrivateRoute";
import CompleteSignup from "@/components/CompleteSignup";
import ForgotPassword from "@/components/ForgotPassword";
import Login from "@/components/Login";
import QuickStart from "@/components/QuickStart";
import ResetPassword from "@/components/ResetPassword";
import Settings from "@/components/Settings";
import Signup from "@/components/Signup";
import Timer from "@/components/Timer";
import routes from "@/routes";

const Main = () => (
  <Routes>
    <Route element={<PrivateRoute />}>
      <Route element={<AppLayout />}>
        <Route element={<QuickStart />} path={routes.root} />
        <Route element={<Timer />} path={routes.timer} />
        <Route element={<Settings />} path={routes.settings} />
      </Route>
    </Route>
    <Route element={<Login />} path={routes.login} />
    <Route element={<Signup />} path={routes.signup.new} />
    <Route element={<CompleteSignup />} path={routes.signup.complete} />
    <Route element={<ForgotPassword />} path={routes.passwords.new} />
    <Route element={<ResetPassword />} path={routes.passwords.edit} />
  </Routes>
);

export default Main;
