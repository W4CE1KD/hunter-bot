require("dotenv").config();

const { Client, GatewayIntentBits, AttachmentBuilder } = require("discord.js");
const mongoose = require("mongoose");
const cron = require("node-cron");

// 🔥 FIXED IMPORT (IMPORTANT)
const PQueue = require("p-queue").default;

const User = require("./models/User");
const { getTHMProfile } = require("./services/scraper");
const { getRank } = require("./services/rank");
const { generateCard } = require("./services/card");

// queue (prevents spam crash)
const queue = new PQueue({ concurrency: 2 });

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;
  if (message.channel.id !== process.env.ALLOWED_CHANNEL) return;

  const args = message.content.trim().split(" ");
  const command = args[0];

  // ======================
  // LINK THM ACCOUNT
  // ======================
  if (command === "!setthm") {

    const username = args[1];
    if (!username) return message.reply("Provide THM username.");

    const profile = await getTHMProfile(username);
    if (!profile) return message.reply("THM profile not found.");

    await User.findOneAndUpdate(
      { discordId: message.author.id },
      {
        discordId: message.author.id,
        thmUsername: username,
        points: profile.points,
        avatar: profile.avatar,
        lastFetched: new Date()
      },
      { upsert: true }
    );

    return message.reply("THM account linked successfully.");
  }

  // ======================
  // RANK COMMAND
  // ======================
  if (command === "!rank") {

    const user = await User.findOne({
      discordId: message.author.id
    });

    if (!user) {
      return message.reply("Link your THM first using !setthm");
    }

    queue.add(async () => {
      try {
        const rank = getRank(user.points);
        const buffer = await generateCard(user, rank);

        const attachment = new AttachmentBuilder(buffer, {
          name: "hunter-license.png"
        });

        await message.reply({ files: [attachment] });

      } catch (err) {
        console.error(err);
        message.reply("Error generating rank card.");
      }
    });
  }
});

// ======================
// BACKGROUND SYNC
// ======================
cron.schedule("0 */6 * * *", async () => {

  console.log("Running background sync...");

  const users = await User.find();

  for (const user of users) {

    const profile = await getTHMProfile(user.thmUsername);

    if (profile) {
      user.points = profile.points;
      user.avatar = profile.avatar;
      user.lastFetched = new Date();
      await user.save();
    }

    // small delay (anti-rate limit)
    await new Promise(res => setTimeout(res, 1500));
  }
});

client.login(process.env.DISCORD_TOKEN);
