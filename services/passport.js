"use strict";
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");

module.exports = passport => {
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
  passport.use(
    new LocalStrategy(
      User.authenticate({
        usernameField: "email"
      })
    )
  );
};
