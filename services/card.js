const { createCanvas, loadImage } = require("canvas");
const path = require("path");

module.exports = async function generateCard(user) {
  const width = 1280;
  const height = 720;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // ===== LOAD TEMPLATE =====
  const template = await loadImage(
    path.join(__dirname, "../assets/license-template.png")
  );
  ctx.drawImage(template, 0, 0, width, height);

  // ===== LOAD AVATAR =====
  const avatar = await loadImage(user.avatar);

  // Avatar position
  const avatarX = 115;
  const avatarY = 170;
  const avatarSize = 240;

  // Avatar border
  ctx.strokeStyle = "#5a6f87";
  ctx.lineWidth = 6;
  ctx.strokeRect(avatarX - 5, avatarY - 5, avatarSize + 10, avatarSize + 10);

  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);

  // ===== TEXT STYLE =====
  ctx.fillStyle = "#111";
  ctx.font = "bold 52px Arial";

  // License
  ctx.fillText("License No.", 520, 190);
  ctx.font = "bold 50px Arial";
  ctx.fillStyle = "#000";
  ctx.fillText(user.license, 520, 240);

  // ===== RANK (moved UP + color) =====
  ctx.font = "bold 58px Arial";
  ctx.fillStyle = "#111";
  ctx.fillText(`Rank : [${user.rank}]`, 820, 215);

  // ===== NAME =====
  ctx.fillStyle = "#111";
  ctx.font = "bold 58px Arial";
  ctx.fillText(`Name : [${user.name}]`, 520, 335);

  // ===== CATEGORY =====
  ctx.font = "bold 54px Arial";
  ctx.fillText("Category", 520, 420);

  // Category boxes (2x2)
  const startX = 520;
  const startY = 445;
  const boxW = 230;
  const boxH = 52;
  const gap = 22;

  ctx.lineWidth = 3;
  ctx.strokeStyle = "#9aa8b5";

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      ctx.strokeRect(
        startX + col * (boxW + gap),
        startY + row * (boxH + 16),
        boxW,
        boxH
      );
    }
  }

  // Hacker text (colorized)
  ctx.fillStyle = "#0b1a2f";
  ctx.font = "bold 44px Arial";
  ctx.fillText("Hacker", startX + 45, startY + 38);

  return canvas.toBuffer();
};
