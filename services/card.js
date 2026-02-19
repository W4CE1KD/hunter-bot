const { createCanvas, loadImage, registerFont } = require("canvas");
const path = require("path");
const fs = require("fs");

// ===== REGISTER FONT =====
registerFont(
  path.join(__dirname, "../fonts/Roboto-Bold.ttf"),
  { family: "Roboto" }
);

// ===== RANK LOGIC =====
function getRank(points) {
  if (points >= 150000) return "S";
  if (points >= 100000) return "A";
  if (points >= 50000) return "B";
  if (points >= 20000) return "C";
  return "D";
}

// ===== MAIN CARD FUNCTION =====
async function generateCard(user) {
  const width = 1600;
  const height = 900;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // ===== LOAD TEMPLATE =====
  const template = await loadImage(
    path.join(__dirname, "../assets/license-template-Photoroom.png")
  );

  ctx.drawImage(template, 0, 0, width, height);

  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillStyle = "#111";

  // ===== AVATAR =====
  let avatarPath = path.join(__dirname, "../assets/default-avatar.png");

  if (user.avatar && fs.existsSync(user.avatar)) {
    avatarPath = user.avatar;
  }

  const avatar = await loadImage(avatarPath);

  ctx.drawImage(
    avatar,
    125, // X
    175, // Y
    220, // W
    280  // H
  );

  // ===== DATA =====
  const licenseNo = String(user.points || 0).padStart(11, "0");
  const rank = getRank(user.points || 0);
  const username = user.thmUsername || "Unknown";

  // ===== LICENSE NUMBER =====
  ctx.font = "bold 42px Roboto";
  ctx.fillText(licenseNo, 430, 255);

  // ===== RANK =====
  ctx.font = "bold 72px Roboto";
  ctx.fillText(rank, 690, 255);

  // ===== USERNAME =====
  ctx.font = "bold 58px Roboto";
  ctx.fillText(username, 430, 330);

  // ===== CATEGORY =====
  ctx.font = "bold 48px Roboto";
  ctx.fillText("Hacker", 700, 470);

  // ===== RETURN BUFFER =====
  return canvas.toBuffer("image/png");
}

module.exports = {
  generateCard,
};
