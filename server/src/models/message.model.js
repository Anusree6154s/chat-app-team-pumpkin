const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

exports.Message = mongoose.model("Message", messageSchema);
