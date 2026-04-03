const { Server } = require("socket.io");
const { createHash } = require("node:crypto");
const chatModel = require("../models/Chat");
const messageModel = require("../models/Message");

let io;

const createSocketRoom = (users) => {
  const createRoomHash = createHash("sha256")
    .update(users.sort().join(""))
    .digest("hex");
  return createRoomHash;
};

const connectWithClient = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", async ({ firstName, senderUserID, targetUserID }) => {
      const room = createSocketRoom([senderUserID, targetUserID]);
      try {
        let chat = await chatModel.findOne({
          participants: { $all: [senderUserID, targetUserID] },
        });

        if (!chat) {
          chat = new chatModel({ participants: [senderUserID, targetUserID] });
        }

        await chat.save();
      } catch (error) {
        console.log(error);
      }
      socket.join(room);
      // console.log(`${firstName} joined room: ${room}`);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, senderUserID, targetUserID, text, photoUrl }) => {
        try {
          let chat = await chatModel.findOne({
            participants: { $all: [senderUserID, targetUserID] },
          });

          if (!chat) {
            chat = new chatModel({
              participants: [senderUserID, targetUserID],
            });
          }

          let message = new messageModel({
            chatId: chat?._id,
            senderId: senderUserID,
            content: text,
          });

          await message.save();
        } catch (error) {
          console.log(error);
        }
        const room = createSocketRoom([senderUserID, targetUserID]);
        io.to(room).emit("receiveMsg", { firstName, text, photoUrl });
      },
    );
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

module.exports = { connectWithClient, getIO };
