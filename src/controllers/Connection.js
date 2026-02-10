const { default: mongoose } = require("mongoose");
const userModel = require("../models/User");
const connectionModel = require("../models/Connection");

const displayAllUsers = async (req, res) => {
  try {
    const allUsers = (await userModel.find({})).filter(
      (user) => user._id != req.user._id,
    );

    const connections = await connectionModel.find({
      $or: [{ user1: req.user._id }, { user2: req.user._id }],
    });

    const connectedUserID = new Set();

    connections.forEach((user) => {
      connectedUserID.add(user.user1.toString());
      connectedUserID.add(user.user2.toString());
    });

    const allUsersExceptConnection = allUsers.filter(
      (user) => !connectedUserID.has(user._id.toString()),
    );

    return res.status(200).json({
      message: "Data retrieved successfully",
      users: allUsersExceptConnection,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const sendRequest = async (req, res) => {
  try {
    const { receiverID } = req.params;

    if (!mongoose.Types.ObjectId.isValid(receiverID)) {
      throw new Error("Invalid userID");
    }

    const userExist = await userModel.findById(receiverID);

    if (!userExist) {
      throw new Error("User not exist");
    }

    if (receiverID == req.user._id) {
      throw new Error("Cannot send request to yourself");
    }

    const connectionExist = await connectionModel.findOne({
      $or: [
        { user1: req.user._id, user2: userExist._id },
        { user1: userExist._id, user2: req.user._id },
      ],
    });

    if (connectionExist?.status == "pending") {
      throw new Error("Request already sent");
    }

    if (connectionExist?.status == "accepted") {
      throw new Error("Users already connected");
    }

    const connection = new connectionModel({
      user1: req.user._id,
      user2: userExist._id,
      status: "pending",
      requestedBy: req.user._id,
    });

    await connection.save();

    return res.status(200).json({ message: "Request sent successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const viewAllSentRequest = async (req, res) => {
  try {
    const allPendingRequest = await connectionModel
      .find({
        requestedBy: req.user._id,
        status: "pending",
      })
      .populate("user2", "firstName lastName photoUrl");
    return res.status(200).json({ user: allPendingRequest });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const viewAllReceivedRequest = async (req, res) => {
  try {
    const allReceivedRequest = await connectionModel
      .find({
        user2: req.user._id,
        status: "pending",
      })
      .populate("user1", "firstName lastName photoUrl");
    return res.status(200).json({ user: allReceivedRequest });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const actionOnRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const { requestID } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestID)) {
      throw new Error("Invalid userID");
    }

    const userExist = await connectionModel.findOne({
      user2: req.user._id,
      requestedBy: requestID,
      status: "pending",
    });

    if (!userExist) {
      throw new Error("User request doesn't exist");
    }

    userExist.status = status;
    await userExist.save();

    return res.json({ message: "Request " + status + "!" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const showAllFriends = async (req, res) => {
  try {
    const allFriend = await connectionModel
      .find({
        $or: [{ user1: req.user._id }, { user2: req.user._id }],
        status: "accepted",
      })
      .populate("user1 user2", "firstName");
    return res.status(200).json({ user: allFriend });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  displayAllUsers,
  sendRequest,
  viewAllSentRequest,
  actionOnRequest,
  showAllFriends,
  viewAllReceivedRequest,
};
