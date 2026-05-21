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

// Group chat feature
const createGroup = async (req, res) => {
  try {
    const { name, members, groupPhoto } = req.body;

    const newGroup = await chatModel.create({
      isGroup: true,
      groupName: name,
      groupAdmin: req?.user?._id,
      groupPhoto: groupPhoto || null,
      participants: [req?.user?._id, ...members],
    });

    return res.json({ message: "Group created successfully", group: newGroup });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

const addUserToGroup = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { newMember } = req.body;
    const chatRoom = await chatModel.findById(chatId);

    if (!chatRoom) {
      throw new Error("Chat does not exist");
    }

    if (chatRoom?.groupAdmin != req?.user?._id) {
      throw new Error("You are not the admin of this group");
    }

    if (chatRoom?.participants.includes(newMember)) {
      throw new Error("User is already a member of this group");
    }

    chatRoom.participants.push(newMember);
    await chatRoom.save();

    return res.json({ message: "User added to group successfully", group: chatRoom });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

const removeMemberFromGroup = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { memberId } = req.body;
    const chatRoom = await chatModel.findById(chatId);

    if (!chatRoom) {
      throw new Error("Chat does not exist");
    }

    if (chatRoom?.groupAdmin != req?.user?._id) {
      throw new Error("You are not the admin of this group");
    }

    if (!chatRoom?.participants.includes(memberId)) {
      throw new Error("User is not a member of this group");
    }

    chatRoom.participants = chatRoom.participants.filter((participant) => participant != memberId);
    await chatRoom.save();

    return res.json({ message: "Member removed from group successfully", group: chatRoom });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

const editGroupDetails = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { newName, newPhoto } = req.body;
    const chatRoom = await chatModel.findById(chatId);

    if (!chatRoom) {
      throw new Error("Chat does not exist");
    }

    if (chatRoom?.groupAdmin != req?.user?._id) {
      throw new Error("You are not the admin of this group");
    }

    if (newName) chatRoom.groupName = newName;
    if (newPhoto) chatRoom.groupPhoto = newPhoto;
    await chatRoom.save();

    return res.json({ message: "Group details updated successfully", group: chatRoom });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

const displayGroupUsers = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chatRoom = await chatModel.findOne({ _id: chatId }).populate("participants", "firstName lastName photoUrl");

    if (!chatRoom) {
      throw new Error("Chat does not exist");
    }

    return res.json({ message: "Users fetched successfully!", users: chatRoom.participants });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

const showUserGroups = async (req, res) => {
  try {
    const chatRooms = await chatModel.find({ isGroup: true, participants: { $in: req?.user?._id } }).populate("participants", "firstName lastName photoUrl");
    return res.json({ message: "Groups fetched successfully!", groups: chatRooms });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

const showGroupDetails = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chatRoom = await chatModel.findById(chatId).populate("participants", "firstName lastName photoUrl");

    if (!chatRoom) {
      throw new Error("Chat does not exist");
    }

    return res.json({ message: "Group details fetched successfully!", group: chatRoom });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

const leaveGroup = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chatRoom = await chatModel.findOne({ _id: chatId, participants: { $in: req?.user?._id } });

    if (!chatRoom) {
      throw new Error("Chat does not exist");
    }

    if (chatRoom?.groupAdmin == req?.user?._id) {
      throw new Error("You are the admin of this group, you cannot leave this group");
    }

    chatRoom.participants = chatRoom.participants.filter((participant) => participant != req?.user?._id);
    await chatRoom.save();

    return res.json({ message: "You left the group successfully", group: chatRoom });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

const deleteGroup = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chatRoom = await chatModel.findById(chatId);

    if (!chatRoom) {
      throw new Error("Chat does not exist");
    }

    if (chatRoom?.groupAdmin != req?.user?._id) {
      throw new Error("You are not the admin of this group");
    }

    await chatModel.findByIdAndDelete(chatId);

    return res.json({ message: "Group deleted successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

module.exports = { fetchConnectionChat, removeChatMessage, createGroup, addUserToGroup, removeMemberFromGroup, editGroupDetails, displayGroupUsers, leaveGroup, deleteGroup, showUserGroups, showGroupDetails };
