const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  userId: String,
  lastSeen: { type: Date, default: null },
});

exports.User = mongoose.model("User", userSchema);
