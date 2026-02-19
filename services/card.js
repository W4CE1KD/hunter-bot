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

  // Content area starts after avatar (avatar: x=80, w=250 → ends at 330)
  const contentX = 390;
  const contentW = 740; // ends around x=1130

  // ── Avatar with rank-colored border ──────────────────────────────────────
  try {
    const avatar = await loadImage(user.avatar);
    ctx.strokeStyle = color;
    ctx.lineWidth   = 5;
    ctx.strokeRect(76, 141, 258, 308);
    ctx.drawImage(avatar, 80, 145, 250, 300);
  } catch {}

  // ── Helper: inline label (dark) + value (rank color) ─────────────────────
  function inlineField(label, value, x, y, fontSize = 52) {
    ctx.font      = `bold ${fontSize}px RobotoBold`;
    ctx.fillStyle = "#1e293b";
    ctx.fillText(label, x, y);
    const lw = ctx.measureText(label).width;
    ctx.fillStyle = color;
    ctx.fillText(value, x + lw, y);
  }

  // ── Helper: clean divider — just a simple faded line, NO dots ────────────
  function divider(y) {
    ctx.save();
    // Gradient line that fades at both ends
    const grad = ctx.createLinearGradient(contentX, y, contentX + contentW, y);
    grad.addColorStop(0,   "rgba(0,0,0,0)");
    grad.addColorStop(0.1, color + "55");
    grad.addColorStop(0.9, color + "55");
    grad.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.strokeStyle = grad;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(contentX, y);
    ctx.lineTo(contentX + contentW, y);
    ctx.stroke();
    ctx.restore();
  }

  // ── RANK BADGE — top right (untouched) ───────────────────────────────────
  const rankLabel = `[ ${rank} ]`;
  ctx.font = "bold 54px RobotoBold";
  const rankTextW = ctx.measureText(rankLabel).width;
  const badgeW    = rankTextW + 44;
  const badgeH    = 68;
  const badgeX    = 1120 - badgeW;
  const badgeY    = 98;
  const br        = 10;

  // Badge fill
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

  // Badge border
  ctx.strokeStyle = color;
  ctx.lineWidth   = 2;
  ctx.globalAlpha = 0.8;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // "Rank :" label
  ctx.font      = "bold 38px RobotoBold";
  ctx.fillStyle = "#1e293b";
  ctx.fillText("Rank :", badgeX - 130, badgeY + 45);

  // Rank value inside badge
  ctx.font      = "bold 54px RobotoBold";
  ctx.fillStyle = color;
  ctx.fillText(rankLabel, badgeX + 22, badgeY + 49);

  // ── DIVIDER 1 ─────────────────────────────────────────────────────────────
  divider(192);

  // ── LICENSE NO ───────────────────────────────────────────────────────────
  inlineField("License No. : ", licenseNo, contentX, 252, 48);

  // ── DIVIDER 2 ─────────────────────────────────────────────────────────────
  divider(278);

  // ── NAME ─────────────────────────────────────────────────────────────────
  inlineField("Name : ", `[${user.thmUsername}]`, contentX, 342, 56);

  // ── DIVIDER 3 ─────────────────────────────────────────────────────────────
  divider(370);

  // ── CATEGORY ─────────────────────────────────────────────────────────────
  inlineField("Category : ", category, contentX, 432, 48);

  // ── DIVIDER 4 ─────────────────────────────────────────────────────────────
  divider(458);

  // ── TEAMNAME (left) + CTFs (right) ───────────────────────────────────────
  inlineField("teamname : ", DEFAULT_TEAM, contentX, 522, 44);
  inlineField("ctfs : ", DEFAULT_CTFS, contentX + 480, 522, 44);

  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
