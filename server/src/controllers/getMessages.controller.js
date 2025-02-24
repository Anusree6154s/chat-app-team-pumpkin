const { Message } = require("../models/message.model");

exports.getMessages = async (req, res) => {
  const { receiverId, senderId } = req.query;
  try {
    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { receiverId: senderId, senderId: receiverId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};
