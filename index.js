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

// ======================
// JSON FILE HELPERS
// ======================

function ensureDataFile() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify({}, null, 2));
  }
}

function loadUsers() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_PATH, "utf-8");

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveUsers(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// ======================
// DISCORD CLIENT
// ======================

const client = new Client({
  intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds
  ]
});

client.once("ready", () => {
  console.log(`Bot online: ${client.user.tag}`);
});

// ======================
// COMMAND HANDLER
// ======================

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  // only allowed channel
  if (message.channel.id !== process.env.ALLOWED_CHANNEL) return;

  const args = message.content.trim().split(" ");
  const cmd = args[0];

  const users = loadUsers();

  // ======================
  // LINK THM USER
  // !setthm username
  // ======================
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

  // ======================
  // ADMIN UPDATE POINTS
  // !update @user points
  // ======================
  if (cmd === "!update") {

    if (!message.member.permissions.has(
      PermissionsBitField.Flags.Administrator
    )) {
      return message.reply("Admin only command.");
    }

    const target = message.mentions.users.first();
    const points = parseInt(args[2]);

    if (!target || isNaN(points))
      return message.reply("Usage: !update @user points");

    if (!users[target.id])
      return message.reply("User not linked.");

    users[target.id].points = points;

    saveUsers(users);

    return message.reply("Points updated.");
  }

  // ======================
  // SHOW RANK CARD
  // !rank
  // ======================
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
