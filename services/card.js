const { createCanvas, loadImage } = require("canvas");

async function generateCard(user, rank) {

  const canvas = createCanvas(1000, 500);
  const ctx = canvas.getContext("2d");

  // background
  ctx.fillStyle = "#1e2a38";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // title
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 40px sans-serif";
  ctx.fillText("Hunter's License", 40, 60);

  // avatar
  if (user.avatar) {
    try {
      const avatar = await loadImage(user.avatar);
      ctx.drawImage(avatar, 50, 120, 250, 250);
    } catch {}
  }

  // rank letter
  ctx.fillStyle = rank.color;
  ctx.font = "bold 120px sans-serif";
  ctx.fillText(rank.letter, 820, 200);

  // username
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 40px sans-serif";
  ctx.fillText(user.thmUsername, 350, 200);

  // points
  ctx.font = "30px sans-serif";
  ctx.fillText(`Points: ${user.points}`, 350, 250);

  // rank title
  ctx.fillText(rank.title, 350, 300);

  return canvas.toBuffer();
}

module.exports = { generateCard };
