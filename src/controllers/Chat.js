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

module.exports = { fetchConnectionChat };
