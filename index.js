require("dotenv").config();

const fs = require("fs");
const path = require("path");

const {
  Client,
  GatewayIntentBits,
  AttachmentBuilder,
  PermissionsBitField
} = require("discord.js");

const { generateCard } = require("./services/card");
const { getRank } = require("./services/rank");

const DATA_PATH = path.join(__dirname, "data", "users.json");

function loadUsers() {
  if (!fs.existsSync(DATA_PATH)) return {};
  return JSON.parse(fs.readFileSync(DATA_PATH));
}

function saveUsers(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

const client = new Client({
  intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds
  ]
});

client.once("ready", () => {
  console.log("Bot online:", client.user.tag);
});

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  // only allowed channel
  if (message.channel.id !== process.env.ALLOWED_CHANNEL) return;

  const args = message.content.trim().split(" ");
  const cmd = args[0];

  const users = loadUsers();

  // ==========================
  // LINK THM USER
  // ==========================
  if (cmd === "!setthm") {

    const username = args[1];
    if (!username)
      return message.reply("Usage: !setthm username");

    users[message.author.id] = {
      thmUsername: username,
      points: 0,
      avatar: ""
    };

    saveUsers(users);

    return message.reply("THM account linked.");
  }

  // ==========================
  // ADMIN UPDATE POINTS
  // ==========================
  if (cmd === "!update") {

    if (!message.member.permissions.has(
      PermissionsBitField.Flags.Administrator
    )) {
      return;
    }

    const user = message.mentions.users.first();
    const points = parseInt(args[2]);

    if (!user || isNaN(points))
      return message.reply("Usage: !update @user points");

    if (!users[user.id])
      return message.reply("User not linked.");

    users[user.id].points = points;

    saveUsers(users);

    return message.reply("Points updated.");
  }

  // ==========================
  // SHOW RANK CARD
  // ==========================
  if (cmd === "!rank") {

    const user = users[message.author.id];

    if (!user)
      return message.reply("Use !setthm first.");

    const rank = getRank(user.points);

    const buffer = await generateCard(user, rank);

    const attachment = new AttachmentBuilder(buffer, {
      name: "rank.png"
    });

    return message.reply({
      files: [attachment]
    });
  }

});

client.login(process.env.DISCORD_TOKEN);
