const { createCanvas, loadImage, registerFont } = require("canvas");
const path = require("path");

registerFont(path.join(__dirname, "../fonts/Roboto-Bold.ttf"), {
  family: "RobotoBold",
});

function getRank(points) {
  if (points >= 150000) return "S";
  if (points >= 100000) return "A";
  if (points >= 50000)  return "B";
  if (points >= 20000)  return "C";
  if (points >= 10000)  return "D";
  return "E";
}

function getRankColor(rank) {
  switch (rank) {
    case "S": return "#e11d48";
    case "A": return "#7c3aed";
    case "B": return "#0284c7";
    case "C": return "#16a34a";
    default:  return "#475569";
  }
}

function getCategory(rank) {
  switch (rank) {
    case "S": return "Omniscient";
    case "A": return "Guru";
    case "B": return "Elite Hacker";
    case "C": return "Pro Hacker";
    case "D": return "Hacker";
    default:  return "Script Kiddie";
  }
}

const DEFAULT_TEAM = "morvax60";
const DEFAULT_CTFS = "10";

async function generateCard(user) {
  const width  = 1280;
  const height = 720;
  const canvas = createCanvas(width, height);
  const ctx    = canvas.getContext("2d");

  // ── Background template ──────────────────────────────────────────────────
  const template = await loadImage(
    path.join(__dirname, "../assets/license-template.png")
  );
  ctx.drawImage(template, 0, 0, width, height);

  const licenseNo = String(user.points).padStart(10, "0");
  const rank      = getRank(user.points);
  const color     = getRankColor(rank);
  const category  = getCategory(rank);

  // ── Avatar — image 2 style, slightly lower + a bit wider ─────────────────
  const avatarX = 76;
  const avatarY = 165;  // moved down a bit from 145
  const avatarW = 275;  // slightly wider than 250
  const avatarH = 310;

  try {
    const avatar = await loadImage(user.avatar);
    ctx.strokeStyle = color;
    ctx.lineWidth   = 5;
    ctx.strokeRect(avatarX - 4, avatarY - 4, avatarW + 8, avatarH + 8);
    ctx.drawImage(avatar, avatarX, avatarY, avatarW, avatarH);
  } catch {}

  // Content starts after avatar
  const contentX = avatarX + avatarW + 40;
  const contentW = 750;

  // ── Helper: inline label (dark) + value (rank color) ─────────────────────
  function inlineField(label, value, x, y, fontSize = 52) {
    ctx.font      = `bold ${fontSize}px RobotoBold`;
    ctx.fillStyle = "#1e293b";
    ctx.fillText(label, x, y);
    const lw = ctx.measureText(label).width;
    ctx.fillStyle = color;
    ctx.fillText(value, x + lw, y);
  }

  // ── Helper: gradient fade divider ────────────────────────────────────────
  function divider(y) {
    ctx.save();
    const grad = ctx.createLinearGradient(contentX, y, contentX + contentW, y);
    grad.addColorStop(0,    "rgba(0,0,0,0)");
    grad.addColorStop(0.05, color + "55");
    grad.addColorStop(0.95, color + "55");
    grad.addColorStop(1,    "rgba(0,0,0,0)");
    ctx.strokeStyle = grad;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(contentX, y);
    ctx.lineTo(contentX + contentW, y);
    ctx.stroke();
    ctx.restore();
  }

  // ── RANK BADGE — top right ────────────────────────────────────────────────
  const rankLabel = `[ ${rank} ]`;
  ctx.font = "bold 54px RobotoBold";
  const rankTextW = ctx.measureText(rankLabel).width;
  const badgeW    = rankTextW + 44;
  const badgeH    = 68;
  const badgeX    = 1120 - badgeW;
  const badgeY    = 98;
  const br        = 10;

  ctx.fillStyle   = color;
  ctx.globalAlpha = 0.12;
  ctx.beginPath();
  ctx.moveTo(badgeX + br, badgeY);
  ctx.lineTo(badgeX + badgeW - br, badgeY);
  ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + br);
  ctx.lineTo(badgeX + badgeW, badgeY + badgeH - br);
  ctx.quadraticCurveTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - br, badgeY + badgeH);
  ctx.lineTo(badgeX + br, badgeY + badgeH);
  ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - br);
  ctx.lineTo(badgeX, badgeY + br);
  ctx.quadraticCurveTo(badgeX, badgeY, badgeX + br, badgeY);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = color;
  ctx.lineWidth   = 2;
  ctx.globalAlpha = 0.8;
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.font      = "bold 38px RobotoBold";
  ctx.fillStyle = "#1e293b";
  ctx.fillText("Rank :", badgeX - 130, badgeY + 45);
  ctx.font      = "bold 54px RobotoBold";
  ctx.fillStyle = color;
  ctx.fillText(rankLabel, badgeX + 22, badgeY + 49);

  // ── CONTENT FIELDS ────────────────────────────────────────────────────────
  divider(200);
  inlineField("License No. : ", licenseNo, contentX, 260, 48);

  divider(288);
  inlineField("Name : ", `[${user.thmUsername}]`, contentX, 352, 56);

  divider(380);
  inlineField("Category : ", category, contentX, 440, 48);

  divider(468);
  inlineField("teamname : ", DEFAULT_TEAM, contentX, 530, 44);
  inlineField("ctfs : ", DEFAULT_CTFS, contentX + 480, 530, 44);

  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
