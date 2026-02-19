const { createCanvas, loadImage, registerFont } = require("canvas");
const path = require("path");

// ===== FONT =====
registerFont(path.join(__dirname, "../fonts/Roboto-Bold.ttf"), {
  family: "RobotoBold",
});

// ===== RANK SYSTEM =====
function getRank(points) {
  if (points >= 150000) return "S";
  if (points >= 100000) return "A";
  if (points >= 50000) return "B";
  if (points >= 20000) return "C";
  return "D";
}

// ===== CARD =====
async function generateCard(user) {
  const width = 1280;
  const height = 720;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // TEMPLATE
  const template = await loadImage(
    path.join(__dirname, "../assets/license-template.png")
  );
  ctx.drawImage(template, 0, 0, width, height);

  // ===== AVATAR =====
  try {
    const avatar = await loadImage(user.avatar);
    ctx.drawImage(avatar, 75, 145, 255, 300);
  } catch {}

  ctx.fillStyle = "#111";
  ctx.strokeStyle = "#9aa3af";
  ctx.lineWidth = 3;

  const licenseNo = String(user.points).padStart(10, "0");
  const rank = getRank(user.points);

  // ===== LICENSE =====
  ctx.font = "bold 48px RobotoBold";
  ctx.fillText("License No.", 460, 170);

  ctx.strokeRect(460, 185, 330, 58);

  ctx.font = "bold 52px RobotoBold";
  ctx.fillText(licenseNo, 475, 230);

  // ===== RANK (UP + BOXED) =====
  ctx.font = "bold 48px RobotoBold";
  ctx.fillText("Rank :", 820, 170);

  ctx.strokeRect(950, 185, 120, 58);

  ctx.font = "bold 60px RobotoBold";
  ctx.fillText(rank, 995, 230);

  // ===== NAME (BOXED) =====
  ctx.font = "bold 48px RobotoBold";
  ctx.fillText("Name :", 460, 285);

  ctx.strokeRect(460, 300, 610, 58);

  ctx.font = "bold 56px RobotoBold";
  ctx.fillText(user.thmUsername, 480, 345);

  // ===== CATEGORY =====
  ctx.font = "bold 48px RobotoBold";
  ctx.fillText("Category", 460, 420);

  // CATEGORY GRID ONLY
  const startX = 460;
  const startY = 440;
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

  // HACKER FIRST BOX CENTER
  ctx.font = "bold 40px RobotoBold";
  const text = "Hacker";

  const textWidth = ctx.measureText(text).width;
  const textX = startX + (boxW - textWidth) / 2;
  const textY = startY + boxH / 2 + 14;

  ctx.fillText(text, textX, textY);

  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
