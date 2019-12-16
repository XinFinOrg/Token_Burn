const mongoose = require("mongoose");

const merchantSchema = mongoose.Schema({
  email: { type: String, required: true },
  merchantName: String,
  merchantId: { type: String, unique: true, required: true },
  owner: { type: String, required: true },
  status: Boolean,
  burnPercent: String,
  burnDecimals: String,
  burnStatus: Boolean,
  created: String,
  lastActive: String,
  hash: String
});

module.exports = mongoose.model("Merchant", merchantSchema);
