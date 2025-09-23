const userModel = require("../models/User");
const validator = require("validator");
const bcryptjs = require("bcryptjs");

const userSignup = async (req, res) => {
  try {
    const { firstName, lastName, age, gender, photoUrl, email, password } =
      req.body;

    // Check if user exist
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Allowed fields
    const allowedFields = [
      "firstName",
      "lastName",
      "age",
      "gender",
      "photoUrl",
      "email",
      "password",
    ];

    // Check for invalid fields
    const invalidFields = Object.keys(req.body).filter(
      (item) => !allowedFields.includes(item)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({ error: "Fill only allowed fields" });
    }

    // Check if email is valid
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Email not valid" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const user = new userModel({
      firstName,
      lastName,
      age,
      gender,
      email,
      password: hashedPassword,
    });

    await user.save();
    return res.status(201).send({ message: "User created successfully" });
  } catch (error) {
    return res.status(400).json({ error: error });
  }
};

module.exports = { userSignup };
