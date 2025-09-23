const express = require("express");
const userRouter = express.Router();
const { userSignup } = require("../controllers/User");

userRouter.post("/signup", userSignup);

module.exports = userRouter;
