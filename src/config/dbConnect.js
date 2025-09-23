const mongoose = require("mongoose");

const DatabaseConnection = async (url) => {
  return await mongoose.connect(url);
};

module.exports = { DatabaseConnection };
