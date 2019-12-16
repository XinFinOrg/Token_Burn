const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema({
  email: { type: String, required: true },
  purpose: { type: String, required: true },
  tokenId: { type: String, required: true, unique: true },
  used: Boolean,
  createdAt: String,
  usedAt: String
});
