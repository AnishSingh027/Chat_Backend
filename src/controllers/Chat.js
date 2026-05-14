const chatModel = require("../models/Chat");
const messageModel = require("../models/Message");

const fetchConnectionChat = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user._id;

    const chatRoom = await chatModel.findOne({
      participants: { $all: [userId, targetUserId] },
    });

    if (!chatRoom) {
      chatRoom = new chatModel({ participants: [targetUserId, userId] });
    }

    const findChats = await messageModel
      .find({ chatId: chatRoom._id })
      .populate("senderId", "firstName lastName photoUrl");

    res
      .status(200)
      .json({ message: "Message fetched successfully", chat: findChats });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const removeChatMessage = async (req, res) => {
  try {
    const { messageID } = req.body;
    const isMessageExist = await messageModel.findOne({
      _id: messageID,
      senderId: req?.user?._id,
    });

    if (!isMessageExist) {
      throw new Error("Message does not exist");
    }

    if (isMessageExist?.senderId != req?.user?._id) {
      throw new Error("You cannot remove this message");
    }

    await messageModel.findByIdAndDelete(messageID);

    return res.json({ message: "Message removed successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = { fetchConnectionChat, removeChatMessage };
