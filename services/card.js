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

  // ===== TEMPLATE =====
  const template = await loadImage(
    path.join(__dirname, "../assets/license-template.png")
  );

  ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

  // ===== AVATAR =====
  if (user.avatar) {
    try {
      const avatar = await loadImage(user.avatar);

      // PERFECT FIT INSIDE FRAME
      ctx.drawImage(avatar, 90, 160, 220, 260);

    } catch (e) {
      console.log("avatar error");
    }
  }

  // ===== TEXT STYLE =====
  ctx.fillStyle = "#111";

  // LICENSE NUMBER
  ctx.font = "28px Roboto";
  const licenseNo = String(user.points).padStart(12, "0");
  ctx.fillText(licenseNo, 430, 240);

  // RANK LETTER ONLY
  ctx.font = "bold 60px Roboto";
  const rankLetter = rank.replace("-RANK", "");
  ctx.fillText(rankLetter, 675, 240);

  // NAME (FIXED POSITION)
  ctx.font = "bold 42px Roboto";
  ctx.fillText(user.thmUsername, 430, 330);

  // CATEGORY
  ctx.font = "bold 34px Roboto";
  ctx.fillText("Hacker", 780, 430);

  return canvas.toBuffer();
}

module.exports = { generateCard };
