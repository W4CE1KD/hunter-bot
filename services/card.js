const { createCanvas, loadImage } = require("canvas");

async function generateCard(user, rank) {

  const canvas = createCanvas(900, 300);
  const ctx = canvas.getContext("2d");

  // background
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // avatar
  try {
    if (user.avatar) {
      const avatar = await loadImage(user.avatar);
      ctx.drawImage(avatar, 30, 75, 150, 150);
    }
  } catch {}

  // text
  ctx.fillStyle = "#ffffff";
  ctx.font = "28px sans-serif";
  ctx.fillText(user.thmUsername, 220, 100);

  ctx.font = "22px sans-serif";
  ctx.fillText(`Points: ${user.points}`, 220, 150);

  ctx.fillStyle = "#00ff99";
  ctx.font = "30px sans-serif";
  ctx.fillText(rank, 220, 210);

  return canvas.toBuffer();
}

module.exports = { generateCard };
