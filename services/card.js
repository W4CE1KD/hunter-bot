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

  const template = await loadImage(
    path.join(__dirname, "../assets/license-template.png")
  );
  ctx.drawImage(template, 0, 0, width, height);

  // ===== AVATAR =====
  try {
    const avatar = await loadImage(user.avatar);
    ctx.drawImage(avatar, 85, 150, 250, 300);
  } catch {}

  ctx.fillStyle = "#111";

  // ===== HEADINGS =====
  ctx.font = "bold 42px RobotoBold";
  ctx.fillText("License No.", 470, 180);
  ctx.fillText("Rank:", 860, 180);
  ctx.fillText("Name:", 470, 280);
  ctx.fillText("Category:", 470, 380);

  // ===== VALUES =====
  const licenseNo = String(user.points).padStart(10, "0");

  ctx.font = "bold 52px RobotoBold";
  ctx.fillText(licenseNo, 470, 235);

  ctx.font = "bold 72px RobotoBold";
  ctx.fillText(getRank(user.points), 860, 235);

  ctx.font = "bold 58px RobotoBold";
  ctx.fillText(user.thmUsername, 470, 335);

  // ===== CATEGORY BOXES =====
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 3;

  const startX = 470;
  const startY = 400;
  const boxW = 220;
  const boxH = 45;
  const gap = 20;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      ctx.strokeRect(
        startX + col * (boxW + gap),
        startY + row * (boxH + 12),
        boxW,
        boxH
      );
    }
  }

  // ===== HACKER INSIDE BOX =====
  ctx.font = "bold 42px RobotoBold";
  ctx.fillText("Hacker", startX + 2 * (boxW + gap) + 50, startY + 85);

  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
