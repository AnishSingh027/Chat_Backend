const express = require("express");
const userRouter = express.Router();
const {
  userSignup,
  userLogin,
  userLogout,
  updateUserDetails,
  viewProfile,
} = require("../controllers/User");
const { userAuth } = require("../middlewares/Auth");

userRouter.post("/signup", userSignup);
userRouter.get("/login", userLogin);
userRouter.post("/logout", userAuth, userLogout);
userRouter.post("/update-details/:userId", userAuth, updateUserDetails);
userRouter.get("/view-profile", userAuth, viewProfile);

module.exports = userRouter;
