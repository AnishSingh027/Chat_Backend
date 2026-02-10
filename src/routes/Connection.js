const express = require("express");
const {
  displayAllUsers,
  sendRequest,
  viewAllSentRequest,
  actionOnRequest,
  showAllFriends,
  viewAllReceivedRequest,
} = require("../controllers/Connection");
const { userAuth } = require("../middlewares/Auth");

const router = express.Router();

router.get("/all-user", userAuth, displayAllUsers);
router.post("/send-request/:receiverID", userAuth, sendRequest);
router.get("/view-sent-request/", userAuth, viewAllSentRequest);
router.get("/view-received-request/", userAuth, viewAllReceivedRequest);
router.get("/view-friends/", userAuth, showAllFriends);
router.post("/action-request/:requestID", userAuth, actionOnRequest);

module.exports = router;
