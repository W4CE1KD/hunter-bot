// card.js
const { createCanvas, loadImage, registerFont } = require("canvas");
const path = require("path");

// ─────────────────────────────────────────
// FONTS
// ─────────────────────────────────────────
registerFont(path.join(__dirname, "../fonts/Roboto-Bold.ttf"), {
  family: "RobotoBold",
});

registerFont(path.join(__dirname, "../fonts/Roboto-Regular.ttf"), {
  family: "Roboto",
});

// ─────────────────────────────────────────
// RANK LOGIC
// ─────────────────────────────────────────
function getRank(points) {
  if (points >= 150000) return "S";
  if (points >= 100000) return "A";
  if (points >= 50000) return "B";
  if (points >= 20000) return "C";
  if (points >= 10000) return "D";
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

// ─────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────
async function generateCard(user) {
  const width = 1280;
  const height = 720;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Template
  const template = await loadImage(
    path.join(__dirname, "../assets/license-template.png")
  );
  ctx.drawImage(template, 0, 0, width, height);

  const points = user.points ?? 0;
  const licenseNo = String(points).padStart(10, "0");
  const rank = getRank(points);
  const color = getRankColor(rank);
  const category = getCategory(rank);

  // ─────────────────────────────────────────
  // Avatar
  // ─────────────────────────────────────────
  const avatarX = 76;
  const avatarY = 195;
  const avatarW = 275;
  const avatarH = 310;

  try {
    const avatar = await loadImage(user.avatar);
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.strokeRect(avatarX - 4, avatarY - 4, avatarW + 8, avatarH + 8);
    ctx.drawImage(avatar, avatarX, avatarY, avatarW, avatarH);
  } catch {}

  const contentX = avatarX + avatarW + 15;
  const contentW = 750;

  // ⭐ NEW: License should start above avatar
  const licenseX = avatarX + 10;

  // ─────────────────────────────────────────
  // Badge helper
  // ─────────────────────────────────────────
  function drawBadge(x, y, w, h, r = 8) {
    ctx.save();
    ctx.fillStyle = color;
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
    ctx.restore();
  }

  // ─────────────────────────────────────────
  // Label + Value
  // ─────────────────────────────────────────
  function inlineField(label, value, x, y, fontSize = 52) {
    const safeValue = value == null ? "" : String(value);

    // LABEL (bold)
    ctx.font = `bold ${fontSize}px RobotoBold`;
    ctx.fillStyle = "#1e293b";
    ctx.fillText(label, x, y);
    const lw = ctx.measureText(label).width;

    // VALUE (normal)
    ctx.font = `${fontSize}px Roboto`;
    const vw = ctx.measureText(safeValue).width;

    const padX = 26;
    const padY = 14;
    const badgeH = fontSize + padY * 2;
    const valueX = x + lw;
    const badgeY = y - fontSize - padY + 6;

    drawBadge(valueX - 8, badgeY, vw + 8 + padX, badgeH);

    ctx.fillStyle = color;
    ctx.fillText(safeValue, valueX, y);
  }

  // ─────────────────────────────────────────
  // Divider
  // ─────────────────────────────────────────
  function divider(y) {
    ctx.save();
    const grad = ctx.createLinearGradient(contentX, y, contentX + contentW, y);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(0.05, color + "55");
    grad.addColorStop(0.95, color + "55");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(contentX, y);
    ctx.lineTo(contentX + contentW, y);
    ctx.stroke();
    ctx.restore();
  }

  // ─────────────────────────────────────────
  // Rank badge (top right)
  // ─────────────────────────────────────────
  const rankLabel = `[ ${rank} ]`;

  ctx.font = "bold 54px RobotoBold";
  const rankTextW = ctx.measureText(rankLabel).width;

  const badgeW = rankTextW + 44;
  const badgeH = 68;
  const badgeX = 1170 - rankTextW - 44;
  const badgeY = 98;

  drawBadge(badgeX, badgeY, badgeW, badgeH, 10);

  ctx.font = "bold 38px RobotoBold";
  ctx.fillStyle = "#1e293b";
  ctx.fillText("Rank :", badgeX - 130, badgeY + 45);

  ctx.font = "54px Roboto";
  ctx.fillStyle = color;
  ctx.fillText(rankLabel, badgeX + 22, badgeY + 49);

  // ─────────────────────────────────────────
  // ⭐ LICENSE — now above avatar
  // ─────────────────────────────────────────
  inlineField("License : ", licenseNo, licenseX, badgeY + 49, 42);

  // ─────────────────────────────────────────
  // Content
  // ─────────────────────────────────────────
  divider(200);

  inlineField(
    "Name : ",
    user.thmUsername ?? "Unknown",
    contentX,
    270,
    56
  );

  divider(298);
  inlineField("Category : ", category, contentX, 358, 48);

  divider(386);
  inlineField("Team : ", DEFAULT_TEAM, contentX, 448, 44);
  inlineField("CTF : ", DEFAULT_CTFS, contentX + 480, 448, 44);

  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
