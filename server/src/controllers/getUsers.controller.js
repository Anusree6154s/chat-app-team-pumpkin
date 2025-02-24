const { User } = require("../models/user.model");

exports.getUsers = async (req, res) => {
  try {
    const data = await User.find().select("name email phone userId -_id");
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};
