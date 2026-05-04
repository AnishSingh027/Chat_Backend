const bcryptjs = require("bcryptjs");
const userModel = require("../models/User");
const otpModel = require("../models/OTP");
const { getRedis } = require("./redis");
const { sendEmail } = require("./sendEmail");

const generateOTP = (num) => {
  let OTP = 0;

  for (let i = 1; i <= num; i++) {
    OTP = Math.round(OTP * 10 + Math.random() * 10);
  }

  return OTP;
};

const sendOTPToUser = (status) => {
  return async (req, res) => {
    try {
      const { email } = req.body;

      const existingUser = await userModel.findOne({ email });

      if (!existingUser) {
        return res.status(400).json({ message: "User not found" });
      }

      const OTP = generateOTP(6);

      sendEmail(email, status, OTP);

      const hashedOTP = await bcryptjs.hash(String(OTP), 10);

      const limitKey = `user:${existingUser._id}:${status}:limit`;

      const attempts = await getRedis().incr(limitKey);

      if (attempts === 1) {
        await getRedis().expire(limitKey, 600);
      }

      if (attempts > 5) {
        return res
          .status(400)
          .json({ message: "Too many attempts, try again later" });
      }

      await getRedis().set(
        `user:${existingUser._id}:${status}`,
        hashedOTP,
        "EX",
        600,
      );

      return res
        .status(200)
        .json({ message: `OTP sent to email ID : ${email}` });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };
};

const sendOTPToLoggedInUser = (status) => {
  return async (req, res) => {
    try {
      const { email } = req.body;

      if (email != req.user.email) {
        return res.status(400).json({ message: "Incorrect email" });
      }

      const existingUser = await userModel.findOne({ email });

      if (!existingUser) {
        return res.status(400).json({ message: "User not found" });
      }

      const existingOTP = await otpModel.findOne({
        email,
        otptype: status,
      });

      if (existingOTP) {
        await otpModel.findByIdAndDelete(existingOTP._id);
      }

      const OTP = generateOTP(6);

      console.log(OTP);

      const hashedOTP = await bcryptjs.hash(String(OTP), 10);

      const otp = new otpModel({
        userId: existingUser._id,
        email,
        otp: hashedOTP,
        otptype: status,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        isUsed: false,
        createdAt: Date.now(),
      });

      await otp.save();

      return res
        .status(200)
        .json({ message: `OTP sent to email ID : ${email}` });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };
};

module.exports = { generateOTP, sendOTPToUser, sendOTPToLoggedInUser };
