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

  // ── Avatar with rank-colored border ─────────────────────────────────────
  try {
    const avatar = await loadImage(user.avatar);
    // Rank color border
    ctx.strokeStyle = color;
    ctx.lineWidth   = 6;
    ctx.strokeRect(74, 139, 262, 312);
    ctx.drawImage(avatar, 80, 145, 250, 300);
  } catch {}

  // ── Helper: inline field — label dark, value in rank color ───────────────
  function inlineField(label, value, x, y, fontSize = 52) {
    ctx.font      = `bold ${fontSize}px RobotoBold`;
    ctx.fillStyle = "#2d3748";
    ctx.fillText(label, x, y);
    const lw = ctx.measureText(label).width;
    ctx.fillStyle = color;
    ctx.fillText(value, x + lw, y);
  }

  // ── Helper: thin horizontal divider line ─────────────────────────────────
  function divider(x, y, w) {
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ── Left accent bar (rank color) ─────────────────────────────────────────
  ctx.fillStyle   = color;
  ctx.globalAlpha = 0.8;
  ctx.fillRect(355, 100, 5, 520);
  ctx.globalAlpha = 1;

  // ── RANK BADGE — top right ────────────────────────────────────────────────
  // Badge background pill
  const rankLabel = `[ ${rank} ]`;
  ctx.font = "bold 52px RobotoBold";
  const rankW = ctx.measureText(rankLabel).width + 40;
  const bx = 1100 - rankW, by = 100, bh = 65, br = 12;

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.moveTo(bx + br, by);
  ctx.lineTo(bx + rankW - br, by);
  ctx.quadraticCurveTo(bx + rankW, by, bx + rankW, by + br);
  ctx.lineTo(bx + rankW, by + bh - br);
  ctx.quadraticCurveTo(bx + rankW, by + bh, bx + rankW - br, by + bh);
  ctx.lineTo(bx + br, by + bh);
  ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - br);
  ctx.lineTo(bx, by + br);
  ctx.quadraticCurveTo(bx, by, bx + br, by);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Badge border
  ctx.strokeStyle = color;
  ctx.lineWidth   = 2;
  ctx.stroke();

  // "Rank :" label
  ctx.font      = "bold 36px RobotoBold";
  ctx.fillStyle = "#2d3748";
  ctx.fillText("Rank :", bx - 120, by + 43);

  // Rank value
  ctx.font      = "bold 52px RobotoBold";
  ctx.fillStyle = color;
  ctx.fillText(rankLabel, bx + 20, by + 47);

  // ── DIVIDER under rank ────────────────────────────────────────────────────
  divider(380, 188, 740);

  // ── LICENSE NO ───────────────────────────────────────────────────────────
  inlineField("License No. : ", licenseNo, 380, 250, 48);

  // ── DIVIDER ───────────────────────────────────────────────────────────────
  divider(380, 278, 740);

  // ── NAME ─────────────────────────────────────────────────────────────────
  inlineField("Name : ", `[${user.thmUsername}]`, 380, 340, 56);

  // ── DIVIDER ───────────────────────────────────────────────────────────────
  divider(380, 365, 740);

  // ── CATEGORY ─────────────────────────────────────────────────────────────
  inlineField("Category : ", category, 380, 425, 48);

  // ── DIVIDER ───────────────────────────────────────────────────────────────
  divider(380, 450, 740);

  // ── TEAMNAME (left) + CTFs (right) ───────────────────────────────────────
  inlineField("teamname : ", DEFAULT_TEAM, 380, 515, 44);
  inlineField("ctfs : ", DEFAULT_CTFS, 870, 515, 44);

  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
