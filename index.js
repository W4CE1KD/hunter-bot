require("dotenv").config();
const { Client, GatewayIntentBits, AttachmentBuilder } = require("discord.js");
const mongoose = require("mongoose");
const cron = require("node-cron");
const PQueue = require("p-queue");
const User = require("./models/User");
const { getTHMProfile } = require("./services/scraper");
const { getRank } = require("./services/rank");
const { generateCard } = require("./services/card");

const queue = new PQueue({ concurrency: 2 });

mongoose.connect(process.env.MONGO_URI);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on("messageCreate", async (message) => {
  if (message.channel.id !== process.env.ALLOWED_CHANNEL) return;
  if (message.author.bot) return;

  const args = message.content.split(" ");
  const command = args[0];

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

  if (command === "!rank") {
    const user = await User.findOne({ discordId: message.author.id });
    if (!user) return message.reply("Link your THM using !setthm");

    queue.add(async () => {
      const rank = getRank(user.points);
      const buffer = await generateCard(user, rank);
      const attachment = new AttachmentBuilder(buffer, { name: "hunter-license.png" });
      message.reply({ files: [attachment] });
    });
  }
});

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

    await new Promise(res => setTimeout(res, 1500));
  }
});

client.login(process.env.DISCORD_TOKEN);
