import { Navigate, Route, Routes } from "react-router";

import Calendar from "@/components/Calendar";
import AppLayout from "@/components/commons/AppLayout";
import PrivateRoute from "@/components/commons/PrivateRoute";
import CompleteSignup from "@/components/CompleteSignup";
import ForgotPassword from "@/components/ForgotPassword";
import Home from "@/components/Home";
import LifeAreas from "@/components/LifeAreas";
import TaskBoard from "@/components/LifeAreas/TaskBoard";
import NoTaskSelected from "@/components/LifeAreas/TaskBoard/NoTaskSelected";
import TaskPane from "@/components/LifeAreas/TaskBoard/TaskPane";
import Login from "@/components/Login";
import ParkingLot from "@/components/ParkingLot";
import ResetPassword from "@/components/ResetPassword";
import Routines from "@/components/Routines";
import NoRoutineSelected from "@/components/Routines/NoRoutineSelected";
import RoutinePane from "@/components/Routines/RoutinePane";
import Settings from "@/components/Settings";
import Signup from "@/components/Signup";
import Timer from "@/components/Timer";
import routes from "@/routes";

const Main = () => (
  <Routes>
    <Route element={<PrivateRoute />}>
      <Route element={<AppLayout />}>
        <Route element={<Home />} path={routes.root} />
        <Route element={<Routines />} path={routes.routines.index}>
          <Route index element={<NoRoutineSelected />} />
          <Route element={<RoutinePane />} path={routes.routines.show} />
        </Route>
        <Route element={<LifeAreas />}>
          <Route element={<TaskBoard />} path={routes.inbox.index}>
            <Route index element={<NoTaskSelected />} />
            <Route element={<TaskPane />} path={routes.inbox.show} />
          </Route>
          <Route element={<TaskBoard />} path={routes.lifeAreas.show}>
            <Route index element={<NoTaskSelected />} />
            <Route element={<TaskPane />} path={routes.lifeAreas.task} />
          </Route>
        </Route>
        <Route element={<Navigate replace to={routes.inbox.index} />} path={routes.lifeAreas.index} />
        <Route element={<Timer />} path={routes.timer} />
        <Route element={<ParkingLot />} path={routes.parkingLot} />
        <Route element={<Calendar />} path={routes.calendar} />
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
