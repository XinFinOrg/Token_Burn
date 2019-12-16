const User = require("../models/user");

module.exports = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (user != null) {
      if (user.role == "1") {
        next();
      } else {
        res.status(404).send("not found");
      }
    } else {
      res.redirect("/login");
    }
  } catch (e) {
    res.status(500).send("internal error");
  }
};
