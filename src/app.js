const express = require("express");
const { createServer } = require("node:http");
require("dotenv/config");
const app = express();
const { DatabaseConnection } = require("./config/dbConnect");
const userRouter = require("./routes/User");
const connectionRouter = require("./routes/Connection");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { connectWithClient } = require("./config/socket.js");
const chatRouter = require("./routes/Chat.js");

const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

const httpServer = createServer(app);
connectWithClient(httpServer);

app.use(cookieParser());
app.use(express.json());
app.use("/user", userRouter);
app.use("/connection", connectionRouter);
app.use("/chat", chatRouter);

DatabaseConnection(process.env.DB_Connection)
  .then(() => {
    console.log("Database connected successfully");
    httpServer.listen(PORT, () =>
      console.log(`Server started at PORT : ${PORT}`),
    );
  })
  .catch(() => console.log("Problem occured while connecting database"));
