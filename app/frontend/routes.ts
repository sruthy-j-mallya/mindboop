const routes = {
  root: "/",
  login: "/login",
  settings: "/settings",
  timer: "/timer",
  parkingLot: "/parking-lot",
  calendar: "/calendar",
  inbox: {
    index: "/inbox",
    show: "/inbox/:taskId",
  },
  routines: {
    index: "/routines",
    show: "/routines/:routineId",
  },
  lifeAreas: {
    // Leads to the Inbox, where the areas are listed beside it.
    index: "/areas",
    show: "/areas/:lifeAreaId",
    task: "/areas/:lifeAreaId/:taskId",
  },
  signup: {
    new: "/signup",
    // Rails mailers link here through the `complete_signup` route.
    complete: "/signup/:token",
  },
  passwords: {
    new: "/passwords/new",
    // Rails mailers link here through the `edit_password` route.
    edit: "/passwords/:token/edit",
  },
};

export default routes;
