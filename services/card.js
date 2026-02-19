const { createCanvas, loadImage, registerFont } = require("canvas");
const path = require("path");

registerFont(path.join(__dirname, "../fonts/Roboto-Bold.ttf"), {
  family: "RobotoBold",
});

function getRank(points) {
  if (points >= 150000) return "S";
  if (points >= 100000) return "A";
  if (points >= 50000) return "B";
  if (points >= 20000) return "C";
  return "D";
}

async function generateCard(user) {
  const width = 1280;
  const height = 720;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // ===== TEMPLATE =====
  const template = await loadImage(
    path.join(__dirname, "../assets/license-template-Photoroom.png")
  );
  ctx.drawImage(template, 0, 0, width, height);

  // ===== AVATAR =====
  try {
    const avatar = await loadImage(user.avatar);
    ctx.drawImage(avatar, 95, 170, 210, 260);
  } catch {
    console.log("avatar failed");
  }

  ctx.fillStyle = "#111";

  // ===== HEADINGS =====
  ctx.font = "34px RobotoBold";
  ctx.fillText("License No.", 460, 180);
  ctx.fillText("Rank:", 860, 180);
  ctx.fillText("Name:", 460, 280);
  ctx.fillText("Category:", 460, 380);

  // ===== VALUES =====
  const licenseNo = String(user.points).padStart(10, "0");

  ctx.font = "bold 46px RobotoBold";
  ctx.fillText(licenseNo, 460, 235);

  ctx.font = "bold 64px RobotoBold";
  ctx.fillText(getRank(user.points), 860, 235);

  ctx.font = "bold 52px RobotoBold";
  ctx.fillText(user.thmUsername, 460, 335);

  // ===== CATEGORY VALUE =====
  ctx.font = "bold 50px RobotoBold";
  ctx.fillText("Hacker", 900, 520);

  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
