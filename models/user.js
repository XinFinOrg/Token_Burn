const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = mongoose.Schema({
  email: { type: String, unique: true, required: true },
  emailConfirmed: Boolean,
  created: String,
  lastActive: String,
  role: { type: Number, required: true }
});


userSchema.plugin(passportLocalMongoose,{usernameField:"email",hashField:"passwordHash"});

module.exports = mongoose.model("User", userSchema);
