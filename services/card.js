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
    ctx.drawImage(avatar, 80, 145, 250, 300);
  } catch {}

  const licenseNo = String(user.points).padStart(10, "0");
  const rank = getRank(user.points);

  ctx.fillStyle = "#111";
  ctx.strokeStyle = "#9aa3af";
  ctx.lineWidth = 3;

  // ===== LICENSE =====
  ctx.font = "bold 48px RobotoBold";
  ctx.fillText("License No.", 460, 170);

  ctx.strokeRect(460, 185, 330, 58);

  ctx.font = "bold 52px RobotoBold";
  ctx.fillText(licenseNo, 475, 230);

  // ===== RANK (NO BOX) =====
  ctx.font = "bold 56px RobotoBold";
  ctx.fillText(`Rank : [${rank}]`, 830, 225);

  // ===== NAME (NO BOX) =====
  ctx.font = "bold 56px RobotoBold";
  ctx.fillText(`Name : [${user.thmUsername}]`, 460, 330);

  // ===== CATEGORY =====
  ctx.font = "bold 52px RobotoBold";
  ctx.fillText("Category", 460, 400);

  // ===== CATEGORY GRID (2 COLUMNS ONLY) =====
  const startX = 460;
  const startY = 420;
  const boxW = 250;
  const boxH = 45;
  const gap = 25;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      ctx.strokeRect(
        startX + col * (boxW + gap),
        startY + row * (boxH + 12),
        boxW,
        boxH
      );
    }
  }

  // HACKER TEXT (FIRST BOX)
  ctx.font = "bold 40px RobotoBold";
  const txt = "Hacker";

  const tw = ctx.measureText(txt).width;
  const tx = startX + (boxW - tw) / 2;
  const ty = startY + boxH / 2 + 14;

  ctx.fillText(txt, tx, ty);

  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
