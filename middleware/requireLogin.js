module.exports = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.session.redirectTo = req.originalUrl;
    res.redirect("/login");
  }
};
