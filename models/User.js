const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  thmUsername: { type: String, required: true },
  points: { type: Number, default: 0 },
  avatar: { type: String, default: "" },
  lastFetched: { type: Date, default: null }
});

module.exports = mongoose.model("User", userSchema);
