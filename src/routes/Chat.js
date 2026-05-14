const express = require("express");
const { userAuth } = require("../middlewares/Auth");
const {
  fetchConnectionChat,
  removeChatMessage,
} = require("../controllers/Chat.js");

const chatRouter = express.Router();

chatRouter.get("/fetch-chat/:targetUserId", userAuth, fetchConnectionChat);
chatRouter.post("/remove-chat", userAuth, removeChatMessage);

module.exports = chatRouter;
