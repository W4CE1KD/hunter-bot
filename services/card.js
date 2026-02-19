const { createCanvas, loadImage } = require("canvas");

async function generateCard(user, rank) {

  const canvas = createCanvas(1000, 500);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#1e2a38";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 40px Arial";
  ctx.fillText("Hunter's License", 40, 60);

  if (user.avatar) {
    try {
      const avatar = await loadImage(user.avatar);
      ctx.drawImage(avatar, 50, 120, 250, 250);
    } catch {}
  }

  ctx.fillStyle = rank.color;
  ctx.font = "bold 120px Arial";
  ctx.fillText(rank.letter, 820, 200);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 40px Arial";
  ctx.fillText(user.thmUsername, 350, 200);

  ctx.font = "30px Arial";
  ctx.fillText(`Points: ${user.points}`, 350, 250);
  ctx.fillText(rank.title, 350, 300);

  return canvas.toBuffer();
}

module.exports = { generateCard };
