const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "accepted", "rejected", "blocked"],
        message: "Status `{VALUE}` is not allowed",
      },
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true },
);

const connectionModel = mongoose.model("Connection", connectionSchema);

module.exports = connectionModel;
