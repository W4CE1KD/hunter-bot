// services/card.js
const { createCanvas, loadImage, registerFont } = require("canvas");
const path = require("path");

// ===== FONT =====
registerFont(path.join(__dirname, "../fonts/Roboto-Bold.ttf"), {
  family: "RobotoBold",
});

// ===== RANK LOGIC =====
function getRank(points) {
  if (points >= 120000) return "S";
  if (points >= 90000) return "A";
  if (points >= 60000) return "B";
  if (points >= 30000) return "C";
  return "D";
}

async function generateCard(user) {
  // TEMPLATE SIZE (IMPORTANT)
  const width = 1536;
  const height = 864;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // ===== LOAD TEMPLATE =====
  const template = await loadImage(
    path.join(__dirname, "../assets/license-template.png")
  );
  ctx.drawImage(template, 0, 0, width, height);

  // ===== AVATAR =====
  try {
    const avatar = await loadImage(user.avatar);

    // exact avatar box from template
    ctx.drawImage(avatar, 120, 200, 230, 300);
  } catch (e) {
    console.log("Avatar failed to load");
  }

  // ===== TEXT STYLE =====
  ctx.fillStyle = "#111";
  ctx.font = "bold 48px RobotoBold";

  // LICENSE NUMBER
  ctx.fillText(
    String(user.points).padStart(10, "0"),
    430,
    355
  );

  // RANK LETTER
  ctx.font = "bold 72px RobotoBold";
  ctx.fillText(getRank(user.points), 650, 360);

  // USERNAME
  ctx.font = "bold 56px RobotoBold";
  ctx.fillText(user.thmUsername, 430, 470);

  // CATEGORY (bottom right box)
  ctx.font = "bold 48px RobotoBold";
  ctx.fillText("Hacker", 1040, 620);

  return canvas.toBuffer();
}

module.exports = { generateCard };
