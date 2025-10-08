const userModel = require("../models/User");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const { generateToken } = require("../config/jwt");
const { generateOTP } = require("../config/helper");
const otpModel = require("../models/OTP");

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
      photoUrl,
      password: hashedPassword,
    });

    await user.save();
    return res.status(201).send({ message: "User created successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email }).lean();

    if (!user) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    const decreptedPassword = await bcryptjs.compare(password, user.password);

    if (!decreptedPassword) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    ["password", "createdAt", "updatedAt", "__v"].map(
      (data) => delete user[data]
    );

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 60 * 60 * 1000,
      secure: false,
    });

    return res.status(200).json({ message: "Login successfully", user });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const userLogout = async (req, res) => {
  res.cookie("token", "", {
    maxAge: 0,
  });

  return res.status(200).json({ message: "User successfully logged out" });
};

const updateUserDetails = async (req, res) => {
  const { userId } = req.params;

  try {
    const existingUser = await userModel.findOne({ email: req.user.email });

    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }

    if (userId != req.user._id) {
      return res.status(400).json({ message: "Edit own details" });
    }

    const allowedFields = [
      "firstName",
      "lastName",
      "age",
      "gender",
      "photoUrl",
      "email",
      "password",
    ];

    const validFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (validFields.length > 0) {
      return res.status(400).json({ error: "Update only allowed fields" });
    }

    let updates = {};

    for (let key of allowedFields) {
      if (req.body[key] != undefined) {
        updates[key] = req.body[key];
      }
    }

    const user = await userModel.findByIdAndUpdate(
      { _id: req.user._id },
      {
        $set: updates,
      },
      {
        runValidators: true,
        new: true,
      }
    );

    await user.save();

    return res.status(200).json({ message: "User details updated", user });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// View logged in user data
const viewProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    return res.status(200).json({ message: "User details", user });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Update existing password
const userResetPassword = async (req, res) => {
  try {
    const { otp, email, password } = req.body || {};

    if (!otp || !password)
      return res.status(400).json({ error: "Provide OTP and password" });

    const otpData = await otpModel.findOne({
      email,
      otptype: "resetPassword",
    });

    const decreptedOTP = await bcryptjs.compare(otp, otpData.otp);

    if (!decreptedOTP) {
      return res.status(400).json({ error: "Incorrect OTP" });
    }

    const expiresTime = new Date(otpData.expiresAt).getTime();

    if (expiresTime < Date.now())
      return res.status(400).json({ error: "OTP expired" });

    if (password == undefined) {
      return res.status(400).json({ error: "Provide new password" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await userModel.findByIdAndUpdate(
      otpData.userId,
      {
        $set: {
          password: hashedPassword,
        },
      },
      { runValidators: true, new: true }
    );

    await user.save();

    await otpModel.findByIdAndDelete(otpData._id);

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const verifyLoggedInUser = async (req, res) => {
  try {
    const { otp } = req.body || {};

    if (!otp) return res.status(400).json({ error: "Provide OTP" });

    const loggedInUser = await userModel.findById(req.user._id);

    if (loggedInUser.isVerified) {
      return res.status(400).json({ error: "User already verified" });
    }

    const otpData = await otpModel.findOne({
      userId: req.user._id,
      otptype: "isVerified",
    });

    const decreptedOTP = await bcryptjs.compare(otp, otpData.otp);

    if (!decreptedOTP) {
      return res.status(400).json({ error: "Incorrect OTP" });
    }

    const expiresTime = new Date(otpData.expiresAt).getTime();

    if (expiresTime < Date.now()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    const user = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        $set: { isVerified: true },
      },
      { runValidators: true }
    );

    await user.save();

    await otpModel.findByIdAndDelete(otpData._id);

    return res.status(200).json({ message: "User verified successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  userSignup,
  userLogin,
  userLogout,
  updateUserDetails,
  viewProfile,
  userResetPassword,
  verifyLoggedInUser,
};
