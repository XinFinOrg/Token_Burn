const authService = require("../services/authService");

module.exports = app => {
  app.post("/formRegister", authService.register);
  app.post("/formLogin", authService.login);
  app.get("/api/currentUser", authService.currentUser);
  app.get("/api/logout", (req, res) => {
    req.logout();
    return res.redirect("/");
  });
};
