const express = require("express");
require("dotenv/config");
const app = express();
const { DatabaseConnection } = require("./config/dbConnect");

const PORT = process.env.PORT || 8000;

DatabaseConnection(process.env.DB_Connection)
  .then(() => {
    console.log("Database connected successfully");
    app.listen(PORT, () => console.log(`Server started at PORT : ${PORT}`));
  })
  .catch(() => console.log("Problem occured while connecting database"));
