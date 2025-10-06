const express = require("express");
const userRouter = express.Router();
const {
  userSignup,
  userLogin,
  userLogout,
  updateUserDetails,
  viewProfile,
  userResetPassword,
  verifyLoggedInUser,
} = require("../controllers/User");
const { userAuth } = require("../middlewares/Auth");
const { sendOTPToUser, sendOTPToLoggedInUser } = require("../config/helper");

userRouter.post("/signup", userSignup);
userRouter.get("/login", userLogin);
userRouter.post("/logout", userAuth, userLogout);
userRouter.post("/update-details/:userId", userAuth, updateUserDetails);
userRouter.get("/view-profile", userAuth, viewProfile);
userRouter.post("/reset-password-otp", sendOTPToUser("resetPassword"));
userRouter.post("/reset-password", userResetPassword);
userRouter.post(
  "/is-verified-otp",
  userAuth,
  sendOTPToLoggedInUser("isVerified")
);
userRouter.post("/is-verified", userAuth, verifyLoggedInUser);

module.exports = userRouter;
