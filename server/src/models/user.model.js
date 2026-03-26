const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  phone: String,
  userId: String,
  lastSeen: { type: Date, default: null },
});
userSchema.index({ email: 1 }, { unique: true });
exports.User = mongoose.model("User", userSchema);
