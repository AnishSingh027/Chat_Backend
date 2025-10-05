const express = require("express");
const userRouter = express.Router();
const {
  userSignup,
  userLogin,
  userLogout,
  updateUserDetails,
  viewProfile,
  resetPasswordOTP,
  userResetPassword,
} = require("../controllers/User");
const { userAuth } = require("../middlewares/Auth");

userRouter.post("/signup", userSignup);
userRouter.get("/login", userLogin);
userRouter.post("/logout", userAuth, userLogout);
userRouter.post("/update-details/:userId", userAuth, updateUserDetails);
userRouter.get("/view-profile", userAuth, viewProfile);
userRouter.post("/reset-password-otp", resetPasswordOTP);
userRouter.post("/reset-password", userResetPassword);

module.exports = userRouter;
