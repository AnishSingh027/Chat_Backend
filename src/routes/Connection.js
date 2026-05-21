const express = require("express");
const {
  displayAllConnections,
  sendRequest,
  viewAllSentRequest,
  actionOnRequest,
  showAllFriends,
  getConnectionDetails,
  displayAllUsers,
  viewAllReceivedRequest,
} = require("../controllers/Connection");
const { userAuth } = require("../middlewares/Auth");

const router = express.Router();

router.get("/all-users", userAuth, displayAllUsers);
router.get("/all-connections", userAuth, displayAllConnections);
router.post("/send-request/:receiverID", userAuth, sendRequest);
router.get("/view-sent-request/", userAuth, viewAllSentRequest);
router.get("/view-received-request/", userAuth, viewAllReceivedRequest);
router.get("/view-friends/", userAuth, showAllFriends);
router.post("/action-request/:requestID", userAuth, actionOnRequest);
router.get("/targetUser-details/:targetUserId", userAuth, getConnectionDetails);

module.exports = router;
