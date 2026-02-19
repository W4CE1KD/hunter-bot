const path = require("path");
const { createCanvas, registerFont, loadImage } = require("canvas");

// register local font
registerFont(
  path.join(__dirname, "../fonts/Roboto-Bold.ttf"),
  { family: "Roboto" }
);

async function generateCard(user, rank) {

  const canvas = createCanvas(900, 300);
  const ctx = canvas.getContext("2d");

  // ===== BACKGROUND =====
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ===== AVATAR (CIRCLE) =====
  if (user.avatar && user.avatar !== "") {
    try {
      const avatar = await loadImage(user.avatar);

      const x = 40;
      const y = 75;
      const size = 150;

      // circle clipping
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(avatar, x, y, size, size);

      ctx.restore();

    } catch (err) {
      console.log("Avatar load failed");
    }
  }

  // ===== TITLE =====
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px Roboto";
  ctx.fillText("TRYHACKME HUNTER LICENSE", 220, 60);

  // ===== USERNAME =====
  ctx.font = "28px Roboto";
  ctx.fillText(`User: ${user.thmUsername}`, 220, 120);

  // ===== POINTS =====
  ctx.font = "24px Roboto";
  ctx.fillText(`Points: ${user.points}`, 220, 170);

  // ===== RANK =====
  ctx.fillStyle = "#00ff99";
  ctx.font = "bold 34px Roboto";
  ctx.fillText(rank, 220, 230);

  return canvas.toBuffer();
}

module.exports = { generateCard };
