const routes = {
  root: "/",
  login: "/login",
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
