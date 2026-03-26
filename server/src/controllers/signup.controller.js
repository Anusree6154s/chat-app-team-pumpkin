const { v4: uuidv4 } = require("uuid");
const { User } = require("../models/user.model");

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone number required"),
});

exports.signup = async (req, res) => {
  const { body } = req;
  try {
    const parsedBody = signupSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        error: parsedBody.error.errors.map((e) => e.message).join(", "),
      });
    }

    const existingUser = await User.findOne({ email: body.email });
    console.log("🚀 ~ existingUser:", existingUser);

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const userId = uuidv4();
    const data = await User.create({ ...body, userId });
    const { name, email, phone, userId: id, lastSeen } = data;
    res.status(201).json({ name, email, phone, userId: id, lastSeen });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};
