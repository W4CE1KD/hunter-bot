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

  // ===== LOAD TEMPLATE =====
  const template = await loadImage(
    path.join(__dirname, "../assets/license-template.png")
  );
  ctx.drawImage(template, 0, 0, width, height);

  // ===== AVATAR =====
  try {
    const avatar = await loadImage(user.avatar);

    // avatar box position (LEFT BOX)
    ctx.drawImage(avatar, 95, 170, 210, 260);
  } catch (e) {
    console.log("avatar load failed");
  }

  // ===== TEXT STYLE =====
  ctx.fillStyle = "#111";
  ctx.font = "bold 46px RobotoBold";

  // ===== LICENSE NUMBER =====
  const licenseNo = String(user.points).padStart(10, "0");
  ctx.fillText(licenseNo, 460, 250);

  // ===== RANK =====
  ctx.font = "bold 64px RobotoBold";
  ctx.fillText(getRank(user.points), 860, 250);

  // ===== NAME =====
  ctx.font = "bold 48px RobotoBold";
  ctx.fillText(user.thmUsername, 460, 340);

  // ===== CATEGORY =====
  ctx.font = "bold 44px RobotoBold";
  ctx.fillText("Hacker", 860, 520);

  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
