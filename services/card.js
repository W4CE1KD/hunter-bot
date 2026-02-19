const { createCanvas } = require("canvas");

async function generateCard(user, rank) {

  const canvas = createCanvas(900, 300);
  const ctx = canvas.getContext("2d");

  // background
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // title
  ctx.fillStyle = "#ffffff";
  ctx.font = "32px sans-serif";
  ctx.fillText("TRYHACKME HUNTER LICENSE", 220, 60);

  // username
  ctx.font = "28px sans-serif";
  ctx.fillText(`User: ${user.thmUsername}`, 220, 120);

  // points
  ctx.font = "24px sans-serif";
  ctx.fillText(`Points: ${user.points}`, 220, 170);

  // rank
  ctx.fillStyle = "#00ff99";
  ctx.font = "34px sans-serif";
  ctx.fillText(rank, 220, 230);

  return canvas.toBuffer();
}

module.exports = { generateCard };
