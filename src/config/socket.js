const { Server } = require("socket.io");
const { createHash } = require("node:crypto");

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
    socket.on("joinChat", ({ firstName, senderUserID, targetUserID }) => {
      const room = createSocketRoom([senderUserID, targetUserID]);
      socket.join(room);
      console.log(`${firstName} joined room: ${room}`);
    });

    socket.on(
      "sendMessage",
      ({ firstName, senderUserID, targetUserID, text, photoUrl }) => {
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
