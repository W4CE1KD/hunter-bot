const path = require("path");
const {
  createCanvas,
  registerFont,
  loadImage
} = require("canvas");

// font
registerFont(
  path.join(__dirname, "../fonts/Roboto-Bold.ttf"),
  { family: "Roboto" }
);

async function generateCard(user, rank) {

  const canvas = createCanvas(1000, 600);
  const ctx = canvas.getContext("2d");

  // ===== LOAD TEMPLATE =====
  const template = await loadImage(
    path.join(__dirname, "../assets/license-template.png")
  );

  ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

  // ===== AVATAR =====
  if (user.avatar) {
    try {
      const avatar = await loadImage(user.avatar);

      // avatar area (left box)
      ctx.drawImage(avatar, 90, 150, 220, 260);

    } catch (e) {
      console.log("avatar failed");
    }
  }

  // ===== TEXT =====

  ctx.fillStyle = "#111";
  ctx.font = "bold 36px Roboto";

  // name
  ctx.fillText(user.thmUsername, 430, 290);

  // rank letter
  ctx.font = "bold 50px Roboto";
  ctx.fillText(rank.replace("-RANK",""), 760, 210);

  // fake license number
  ctx.font = "28px Roboto";
  ctx.fillText(
    String(user.points).padStart(12, "0"),
    430,
    210
  );

  // category example
  ctx.font = "24px Roboto";
  ctx.fillText("Hacker", 780, 390);

  return canvas.toBuffer();
}

module.exports = { generateCard };
