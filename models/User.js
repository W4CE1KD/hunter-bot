const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  discordId: { type: String, unique: true },
  thmUsername: String,
  points: Number,
  avatar: String,
  lastFetched: Date
});

module.exports = mongoose.model("User", userSchema);
