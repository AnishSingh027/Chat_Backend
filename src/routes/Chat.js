const express = require("express");
const { userAuth } = require("../middlewares/Auth");
const { fetchConnectionChat } = require("../controllers/Chat.js");

const chatRouter = express.Router();

chatRouter.get("/fetch-chat/:targetUserId", userAuth, fetchConnectionChat);

module.exports = chatRouter;
