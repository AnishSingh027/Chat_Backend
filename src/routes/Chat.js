const express = require("express");
const { userAuth } = require("../middlewares/Auth.js");
const {
  fetchConnectionChat,
  removeChatMessage,
  showGroupDetails,
} = require("../controllers/Chat.js");

const {
  createGroup,
  addUserToGroup,
  removeMemberFromGroup,
  editGroupDetails,
  displayGroupUsers,
  showUserGroups,
  leaveGroup,
  deleteGroup,
  fetchGroupMessages
} = require("../controllers/Chat.js");

const chatRouter = express.Router();

chatRouter.get("/fetch-chat/:targetUserId", userAuth, fetchConnectionChat);
chatRouter.post("/remove-chat", userAuth, removeChatMessage);
chatRouter.post("/create-group", userAuth, createGroup);
chatRouter.post("/add-member/:chatId", userAuth, addUserToGroup);
chatRouter.delete("/remove-member/:chatId", userAuth, removeMemberFromGroup);
chatRouter.post("/edit-group/:chatId", userAuth, editGroupDetails);
chatRouter.get("/show-groups", userAuth, showUserGroups);
chatRouter.get("/group-details/:chatId", userAuth, showGroupDetails);
chatRouter.get("/group-users/:chatId", userAuth, displayGroupUsers);
chatRouter.get("/group-messages/:chatId", userAuth, fetchGroupMessages);
chatRouter.delete("/leave-group/:chatId", userAuth, leaveGroup);
chatRouter.delete("/delete-group/:chatId", userAuth, deleteGroup);

module.exports = chatRouter;
