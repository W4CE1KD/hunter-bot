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

  // ===== HEADINGS =====
  ctx.font = "bold 48px RobotoBold";
  ctx.fillText("License No.", 460, 175);
  ctx.fillText("Category:", 460, 355);

  // ===== LICENSE BOX =====
  ctx.strokeRect(460, 190, 340, 58);

  const licenseNo = String(user.points).padStart(10, "0");
  const rank = getRank(user.points);

  // LICENSE VALUE
  ctx.font = "bold 52px RobotoBold";
  ctx.fillText(licenseNo, 475, 235);

  // ===== RANK INLINE =====
  ctx.font = "bold 64px RobotoBold";
  ctx.fillText(`Rank : ${rank}`, 820, 235);

  // ===== NAME INLINE (NO BOX) =====
  ctx.font = "bold 58px RobotoBold";
  ctx.fillText(`Name : ${user.thmUsername}`, 460, 315);

  // ===== CATEGORY GRID =====
  const startX = 460;
  const startY = 385;
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

  // ===== HACKER TEXT CENTER =====
  ctx.font = "bold 40px RobotoBold";
  const text = "Hacker";

  const textWidth = ctx.measureText(text).width;
  const textX = startX + (boxW - textWidth) / 2;
  const textY = startY + boxH / 2 + 14;

  ctx.fillText(text, textX, textY);

  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
