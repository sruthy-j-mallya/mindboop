const routes = {
  root: "/",
  login: "/login",
  signup: "/signup",
  passwords: {
    new: "/passwords/new",
    // Rails mailers link here through the `edit_password` route.
    edit: "/passwords/:token/edit",
  },
};

export default routes;
