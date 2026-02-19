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

  const template = await loadImage(
    path.join(__dirname, "../assets/license-template.png")
  );
  ctx.drawImage(template, 0, 0, width, height);

  const licenseNo = String(user.points).padStart(10, "0");
  const rank      = getRank(user.points);
  const color     = getRankColor(rank);
  const category  = getCategory(rank);

  // ── Avatar ────────────────────────────────────────────────────────────────
  const avatarX = 76, avatarY = 195, avatarW = 275, avatarH = 310;
  try {
    const avatar = await loadImage(user.avatar);
    ctx.strokeStyle = color;
    ctx.lineWidth   = 5;
    ctx.strokeRect(avatarX - 4, avatarY - 4, avatarW + 8, avatarH + 8);
    ctx.drawImage(avatar, avatarX, avatarY, avatarW, avatarH);
  } catch {}

  const contentX = avatarX + avatarW + 40;
  const contentW = 750;

  // ── Helper: draw a rounded pill badge behind text ─────────────────────────
  function drawBadge(x, y, w, h, r = 8) {
    ctx.save();
    ctx.fillStyle   = color;
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  // ── Helper: label in dark + value with badge behind it ───────────────────
  function inlineField(label, value, x, y, fontSize = 52) {
    ctx.font = `bold ${fontSize}px RobotoBold`;

    // Draw label
    ctx.fillStyle = "#1e293b";
    ctx.fillText(label, x, y);
    const lw = ctx.measureText(label).width;

    // Measure value for badge size
    const vw      = ctx.measureText(value).width;
    const padX    = 26, padY = 14;
    const badgeH  = fontSize + padY * 2;
    const valueX  = x + lw;
    const badgeY  = y - fontSize - padY + 6;

    // Draw badge behind value
    drawBadge(valueX - padX, badgeY, vw + padX * 2, badgeH);

    // Draw value text
    ctx.fillStyle = color;
    ctx.fillText(value, valueX, y);
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
  const badgeW = rankTextW + 44, badgeH = 68, badgeX = 1120 - rankTextW - 44, badgeY = 98;

  drawBadge(badgeX, badgeY, badgeW, badgeH, 10);

  ctx.font      = "bold 38px RobotoBold";
  ctx.fillStyle = "#1e293b";
  ctx.fillText("Rank :", badgeX - 130, badgeY + 45);
  ctx.font      = "bold 54px RobotoBold";
  ctx.fillStyle = color;
  ctx.fillText(rankLabel, badgeX + 22, badgeY + 49);

  // ── CONTENT FIELDS ────────────────────────────────────────────────────────
  divider(200);
  inlineField("License No : ", licenseNo, contentX, 260, 48);

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
