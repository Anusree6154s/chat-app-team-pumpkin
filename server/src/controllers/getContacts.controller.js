const { Message } = require("../models/message.model");
const { User } = require("../models/user.model");

exports.getContacts = async (req, res) => {
  const { userId } = req.params;
  try {
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    const contactIds = [
      ...new Set(messages.flatMap((msg) => [msg.senderId, msg.receiverId])),
    ].filter((id) => id !== userId);

    const contacts = await User.find({ userId: { $in: contactIds } }).select(
      "name email phone userId"
    ); //SELECT  name, email, phone, userId FROM users WHERE userId IN ('123', '456', '789');

    const contactsWithLastMessage = await Promise.all(
      contacts.map(async (contact) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: userId, receiverId: contact.userId },
            { senderId: contact.userId, receiverId: userId },
          ],
        })
          .sort({ timestamp: -1 })
          .select("message timestamp senderId receiverId");

        const user = await User.findOne({ userId });
        const unseenMessageCount = messages.filter(
          (msg) =>
            (msg.senderId === contact.userId ||
              msg.receiverId === contact.userId) &&
            new Date(msg.timestamp) > new Date(user.lastSeen)
        ).length;

        return {
          ...contact.toObject(), //.toObject() removes unnecessary Mongoose methods
          lastMessage,
          unseenMessageCount,
        };
      })
    );

    res.status(200).json(contactsWithLastMessage);
  } catch (error) {
    console.error("Error fetching chat contacts:", error);
    throw error;
  }
};
