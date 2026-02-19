// services/card.js

const { createCanvas, loadImage } = require("canvas");
const path = require("path");

/*
Expected user object:
{
  name: "m33nan",
  rank: "A",
  license: "0000136839",
  avatar: "https://....",
  category: "Hacker"
}
*/

module.exports = async function generateCard(user) {
  const width = 1280;
  const height = 720;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // =========================
  // LOAD TEMPLATE
  // =========================
  const template = await loadImage(
    path.join(__dirname, "../assets/license-template.png")
  );
  ctx.drawImage(template, 0, 0, width, height);

  // =========================
  // AVATAR (LEFT SIDE)
  // =========================
  const avatar = await loadImage(user.avatar);

  const avatarX = 120;
  const avatarY = 170;
  const avatarSize = 240;

  // Border around avatar
  ctx.strokeStyle = "#6f7f90";
  ctx.lineWidth = 6;
  ctx.strokeRect(
    avatarX - 5,
    avatarY - 5,
    avatarSize + 10,
    avatarSize + 10
  );

  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);

  // =========================
  // TEXT STYLE
  // =========================
  ctx.fillStyle = "#111";
  ctx.textBaseline = "top";

  // ===== License =====
  ctx.font = "bold 52px Arial";
  ctx.fillText("License No.", 520, 160);

  ctx.font = "bold 56px Arial";
  ctx.fillText(user.license, 520, 210);

  // ===== Rank =====
  ctx.font = "bold 60px Arial";
  ctx.fillText(`Rank : [${user.rank}]`, 860, 185);

  // ===== Name =====
  ctx.font = "bold 60px Arial";
  ctx.fillText(`Name : [${user.name}]`, 520, 300);

  // ===== Category Title =====
  ctx.font = "bold 56px Arial";
  ctx.fillText("Category", 520, 390);

  // =========================
  // CATEGORY BOXES (2x2)
  // =========================
  const startX = 520;
  const startY = 445;
  const boxW = 240;
  const boxH = 55;
  const gapX = 25;
  const gapY = 18;

  ctx.strokeStyle = "#9aa8b5";
  ctx.lineWidth = 3;

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      ctx.strokeRect(
        startX + col * (boxW + gapX),
        startY + row * (boxH + gapY),
        boxW,
        boxH
      );
    }
  }

  // Category text inside first box
  ctx.font = "bold 44px Arial";
  ctx.fillStyle = "#0d1a2c";
  ctx.fillText(user.category || "Hacker", startX + 35, startY + 8);

  // =========================
  // RETURN IMAGE BUFFER
  // =========================
  return canvas.toBuffer("image/png");
};
