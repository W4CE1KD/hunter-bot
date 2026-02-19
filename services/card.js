// card.js  (Premium UI upgrade)
// - Keeps your license-template.png
// - Adds vignette + holo streak + subtle noise (less “generic”)
// - Replaces flat pills with GLASS panels
// - Makes Rank feel more “flex” (glow + bigger presence)
// - License moved above avatar
// - Labels bold, values normal
// - Name WITHOUT [ ]

const { createCanvas, loadImage, registerFont } = require("canvas");
const path = require("path");

// ─────────────────────────────────────────
// FONTS (make sure both exist)
//   /fonts/Roboto-Bold.ttf
//   /fonts/Roboto-Regular.ttf
// ─────────────────────────────────────────
registerFont(path.join(__dirname, "../fonts/Roboto-Bold.ttf"), {
  family: "RobotoBold",
});
registerFont(path.join(__dirname, "../fonts/Roboto-Regular.ttf"), {
  family: "Roboto",
});

// ─────────────────────────────────────────
// RANKING
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
    case "S":
      return "#e11d48";
    case "A":
      return "#7c3aed";
    case "B":
      return "#0284c7";
    case "C":
      return "#16a34a";
    default:
      return "#475569";
  }
}

function getCategory(rank) {
  switch (rank) {
    case "S":
      return "Omniscient";
    case "A":
      return "Guru";
    case "B":
      return "Elite Hacker";
    case "C":
      return "Pro Hacker";
    case "D":
      return "Hacker";
    default:
      return "Script Kiddie";
  }
}

const DEFAULT_TEAM = "morvax60";
const DEFAULT_CTFS = "10";

// ─────────────────────────────────────────
// DRAW HELPERS
// ─────────────────────────────────────────
function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function shadowGlow(ctx, x, y, w, h, r, color, blur = 22, alpha = 0.35) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = "rgba(255,255,255,0.001)"; // tiny fill to trigger shadow
  ctx.fill();
  ctx.restore();
}

function drawVignette(ctx, w, h) {
  const g = ctx.createRadialGradient(w / 2, h / 2, 220, w / 2, h / 2, 920);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.28)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawHoloStreak(ctx, w, h) {
  ctx.save();
  ctx.globalAlpha = 0.12;
  const g = ctx.createLinearGradient(180, 120, 980, 540);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.5, "rgba(255,255,255,1)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.rotate(-0.10);
  ctx.fillRect(-250, h * 0.45, w * 1.6, 120);
  ctx.restore();
}

function drawNoise(ctx, w, h) {
  ctx.save();
  ctx.globalAlpha = 0.05;
  // small amount of random pixels (fast enough at 1280x720)
  for (let i = 0; i < 4200; i++) {
    const x = (Math.random() * w) | 0;
    const y = (Math.random() * h) | 0;
    const a = Math.random() * 0.9;
    ctx.fillStyle = `rgba(0,0,0,${a})`;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();
}

// "Glass" panel behind the VALUE only (premium look)
function drawGlassBadge(ctx, x, y, w, h, r, accentColor) {
  ctx.save();

  // base glass
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = "rgba(255,255,255,0.60)";
  ctx.fill();

  // inner highlight
  ctx.globalAlpha = 0.8;
  const hg = ctx.createLinearGradient(x, y, x, y + h);
  hg.addColorStop(0, "rgba(255,255,255,0.55)");
  hg.addColorStop(1, "rgba(255,255,255,0.15)");
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = hg;
  ctx.fill();

  // thin border
  ctx.globalAlpha = 1;
  roundRectPath(ctx, x, y, w, h, r);
  ctx.strokeStyle = "rgba(15,23,42,0.10)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // accent line (left)
  ctx.globalAlpha = 0.9;
  roundRectPath(ctx, x, y, w, h, r);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = accentColor;
  ctx.fillRect(x, y, 6, h);
  ctx.restore();

  ctx.restore();
}

function drawDivider(ctx, x, w, y, accentColor) {
  ctx.save();
  const grad = ctx.createLinearGradient(x, y, x + w, y);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.08, accentColor + "44");
  grad.addColorStop(0.92, accentColor + "44");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  ctx.restore();
}

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

  const points = user?.points ?? 0;
  const licenseNo = String(points).padStart(10, "0");
  const rank = getRank(points);
  const color = getRankColor(rank);
  const category = getCategory(rank);

  // Premium overlays (reduce “generic”)
  drawVignette(ctx, width, height);
  drawHoloStreak(ctx, width, height);
  drawNoise(ctx, width, height);

  // ─────────────────────────────────────────
  // Layout constants
  // ─────────────────────────────────────────
  const avatarX = 76;
  const avatarY = 195;
  const avatarW = 275;
  const avatarH = 310;

  const contentX = avatarX + avatarW + 15;
  const contentW = 750;

  // License above avatar
  const licenseX = avatarX + 10;

  // ─────────────────────────────────────────
  // Avatar (with glow frame)
  // ─────────────────────────────────────────
  // Glow behind frame
  shadowGlow(ctx, avatarX - 6, avatarY - 6, avatarW + 12, avatarH + 12, 10, color, 26, 0.35);

  // Frame
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.strokeRect(avatarX - 4, avatarY - 4, avatarW + 8, avatarH + 8);
  ctx.restore();

  try {
    const avatar = await loadImage(user.avatar);
    ctx.drawImage(avatar, avatarX, avatarY, avatarW, avatarH);
  } catch {
    // ignore avatar errors
  }

  // ─────────────────────────────────────────
  // Field drawer (bold label + normal value + glass)
  // ─────────────────────────────────────────
  function inlineField(label, value, x, y, fontSize = 52) {
    const safeValue = value == null ? "" : String(value);

    // LABEL (bold)
    ctx.font = `bold ${fontSize}px RobotoBold`;
    ctx.fillStyle = "#0f172a";
    ctx.fillText(label, x, y);
    const lw = ctx.measureText(label).width;

    // VALUE (normal)
    ctx.font = `${fontSize}px Roboto`;
    const vw = ctx.measureText(safeValue).width;

    const padX = 24;
    const padY = 12;
    const badgeH = fontSize + padY * 2;
    const valueX = x + lw;
    const badgeY = y - fontSize - padY + 6;

    // glass badge behind value
    drawGlassBadge(ctx, valueX - 10, badgeY, vw + padX + 10, badgeH, 10, color);

    // value text
    ctx.fillStyle = color;
    ctx.fillText(safeValue, valueX, y);
  }

  // ─────────────────────────────────────────
  // Rank (top right) - more “hero”
  // ─────────────────────────────────────────
  const badgeY = 98;

  // Big faint rank behind (adds flex)
  ctx.save();
  ctx.globalAlpha = 0.10;
  ctx.font = "220px RobotoBold";
  ctx.fillStyle = color;
  ctx.fillText(rank, 920, 235);
  ctx.restore();

  // Small rank badge like before, but glass + glow
  const rankLabel = `[ ${rank} ]`;
  ctx.font = "54px Roboto";
  const rankTextW = ctx.measureText(rankLabel).width;

  const rankBadgeW = rankTextW + 46;
  const rankBadgeH = 68;
  const rankBadgeX = 1170 - rankTextW - 46;

  // glow
  shadowGlow(ctx, rankBadgeX, badgeY, rankBadgeW, rankBadgeH, 12, color, 24, 0.35);

  // glass badge
  drawGlassBadge(ctx, rankBadgeX, badgeY, rankBadgeW, rankBadgeH, 12, color);

  // "Rank :" label
  ctx.font = "bold 38px RobotoBold";
  ctx.fillStyle = "#0f172a";
  ctx.fillText("Rank :", rankBadgeX - 130, badgeY + 45);

  // rank value
  ctx.font = "54px Roboto";
  ctx.fillStyle = color;
  ctx.fillText(rankLabel, rankBadgeX + 22, badgeY + 49);

  // ─────────────────────────────────────────
  // LICENSE (top, above avatar)
  // ─────────────────────────────────────────
  inlineField("License : ", licenseNo, licenseX, badgeY + 49, 42);

  // ─────────────────────────────────────────
  // Content fields + dividers
  // ─────────────────────────────────────────
  drawDivider(ctx, contentX, contentW, 200, color);

  // Name (no brackets)
  inlineField("Name : ", user?.thmUsername ?? "Unknown", contentX, 270, 56);

  drawDivider(ctx, contentX, contentW, 298, color);
  inlineField("Category : ", category, contentX, 358, 48);

  drawDivider(ctx, contentX, contentW, 386, color);
  inlineField("Team : ", DEFAULT_TEAM, contentX, 448, 44);
  inlineField("CTF : ", DEFAULT_CTFS, contentX + 480, 448, 44);

  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
