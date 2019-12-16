"use strict";

const User = require("../models/user");
const _ = require("lodash");
const errorCode = require("../helpers/errorCode");
const passport = require("passport");
const { logger } = require("../services/logger");

exports.register = (req, res) => {
  logger.verbose("called authService.register");
  if (_.isEmpty(req.body)) {
    logger.warn("req.body is empty at authService.register");
    return res.status(400).json({
      status: false,
      error: errorCode[400],
      message: "the request body is empty"
    });
  }
  if (_.isEmpty(req.body.email) || _.isEmpty(req.body.password)) {
    logger.warn("req.body is empty at authService.register");
    return res.status(422).json({
      status: false,
      error: errorCode[422],
      message: "missing parameter(s)"
    });
  }
  const email = req.body.email;
  const password = req.body.password;
  const newUser = newDefUser(email);
  User.register(newUser, password, (err, user) => {
    if (err) {
      logger.error("error at authService.register: ", err.toString());
      return res
        .status(500)
        .json({ status: false, error: errorCode[500], message: err.message });
    } else {
      logger.info(`new user registered: ${email}`);
      res.status(200).json({
        status: true,
        error: null,
        message: "new user successfully registered"
      });
    }
  });
};

exports.login = (req, res) => {
  logger.verbose("called authService.login");
  if (_.isEmpty(req.body)) {
    logger.warn("req.body is empty  at authService.login");
    return res
      .status(400)
      .json({ status: false, error: errorCode[400], message: "missing body" });
  }
  if (_.isEmpty(req.body.username) || _.isEmpty(req.body.password)) {
    logger.warn("username / password is empty  at authService.login");
    return res.status(422).json({
      status: false,
      error: errorCode[422],
      message: "missing parameters"
    });
  }
  passport.authenticate("local", (err0, user, info) => {
    if (!err0 && !_.isEmpty(user)) {
      req.login(user, err1 => {
        if (!err1) {
          return res
            .status(200)
            .json({ status: true, message: "loggin successfull", error: null });
        }
      });
    } else return res.json({ status: false, message: info, error: err0 });
  })(req, res);
};

exports.changePassword = async (req, res) => {
  logger.verbose("called changePassword at authService.changePassword");
  if (_.isEmpty(req.body)) {
    logger.verbose("req.body is empty at authService.changePassword");
    return res.status(400).json({
      status: false,
      error: errorCode[400],
      message: "message information is missing"
    });
  }
  if (_.isEmpty(req.body.oldPassword) || _.isEmpty(req.body.newPassword)) {
    logger.verbose(
      "oldPassword / newPassword is empty at authService.changePassword"
    );
    return res.status(422).json({
      status: false,
      error: errorCode[422],
      message: "missing password"
    });
  }
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  const user = await User.findOne({ email: req.user.email });
  if (_.isEmpty(user)) {
    logger.warn(
      `user not found; email: ${req.user.email} at authService.changePassword`
    );
    return res.status(400).json({
      status: false,
      error: errorCode[400],
      message: "user not found."
    });
  }
  user.changePassword(oldPassword, newPassword, err => {
    if (err) {
      logger.error("Error at authService.changePassword: ", err.toString());
      return res
        .json(500)
        .json({ status: false, error: errorCode[500], message: err.message });
    } else {
      req.logout();
      return res.status(200).json({
        status: true,
        error: null,
        message: "passwords changed successfully"
      });
    }
  });
};

// will be added later.
exports.requestForgotPassword = async (req, res) => {};
exports.confirmForgotPassword = async (req, res) => {};
exports.confirmEmail = async (req, res) => {};

exports.currentUser = async (req, res) => {
  logger.verbose("called authService.currentUser");
  if (_.isEmpty(req.user) || _.isEmpty(req.user.email)) {
    return res.json({ error: errorCode[400], status: false, code: -1 });
  }
  const user = await User.findOne({ email: req.user.email });
  if (_.isEmpty(user)) {
    logger.warn(
      `User not found, email: ${req.user.email} at authService.currentUser`
    );
    return res.status(400).json({
      error: errorCode[400],
      message: "user not found",
      status: false,
      code: -1
    });
  }
  return res.status(200).json({ status: true, code: user.role });
};

function newDefUser(email) {
  logger.verbose("called authService.newDefUser");
  const currDate = Date.now();
  return new User({
    email: email,
    emailConfirmed: false,
    created: currDate,
    lastActive: currDate,
    role: 0
  });
}
