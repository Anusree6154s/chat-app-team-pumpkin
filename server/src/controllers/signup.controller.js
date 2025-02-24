const { v4: uuidv4 } = require("uuid");
const { User } = require("../models/user.model");

exports.signup = async (req, res) => {
  const { body } = req;
  const userId = uuidv4();
  try {
    const data = await User.create({ ...body, userId });
    const { name, email, phone, userId: id, lastSeen } = data;
    res.status(201).json({ name, email, phone, userId: id, lastSeen });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};
