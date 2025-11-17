const express = require("express");
require("dotenv/config");
const app = express();
const { DatabaseConnection } = require("./config/dbConnect");
const userRouter = require("./routes/User");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use("/user", userRouter);

DatabaseConnection(process.env.DB_Connection)
  .then(() => {
    console.log("Database connected successfully");
    app.listen(PORT, () => console.log(`Server started at PORT : ${PORT}`));
  })
  .catch(() => console.log("Problem occured while connecting database"));
