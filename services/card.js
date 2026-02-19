// card.js (NEW UI - Cyber / Premium)
// No template image needed.

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
      return "#ff2d55"; // red/pink
    case "A":
      return "#a855f7"; // purple
    case "B":
      return "#38bdf8"; // sky
    case "C":
      return "#22c55e"; // green
    case "D":
      return "#f59e0b"; // amber
    default:
      return "#94a3b8"; // slate
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
// SHAPES
// ─────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
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

function fillRoundRect(ctx, x, y, w, h, r, fillStyle) {
  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.restore();
}

function strokeRoundRect(ctx, x, y, w, h, r, strokeStyle, lineWidth = 1) {
  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.restore();
}

function glowRect(ctx, x, y, w, h, r, glowColor, blur = 26, alpha = 0.35) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = "rgba(255,255,255,0.001)";
  ctx.fill();
  ctx.restore();
}

function drawGrid(ctx, w, h) {
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 1;

  const step = 48;
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawNoise(ctx, w, h) {
  ctx.save();
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 5200; i++) {
    const x = (Math.random() * w) | 0;
    const y = (Math.random() * h) | 0;
    const a = Math.random() * 0.9;
    ctx.fillStyle = `rgba(0,0,0,${a})`;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();
}

// Auto-fit text into max width (returns chosen font size)
function fitText(ctx, text, maxWidth, startSize, minSize, fontFamily, weight = "") {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${weight}${weight ? " " : ""}${size}px ${fontFamily}`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 1;
  }
  return minSize;
}

// ─────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────
async function generateCard(user) {
  const width = 1200;
  const height = 520;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const points = user?.points ?? 0;
  const licenseNo = String(points).padStart(10, "0");
  const rank = getRank(points);
  const accent = getRankColor(rank);
  const category = getCategory(rank);

  // ─────────────────────────────────────────
  // Background (cyber)
  // ─────────────────────────────────────────
  // base gradient
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#070A12");
  bg.addColorStop(0.55, "#0B1020");
  bg.addColorStop(1, "#070A12");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // soft accent blobs
  ctx.save();
  ctx.globalAlpha = 0.22;
  const g1 = ctx.createRadialGradient(260, 140, 10, 260, 140, 320);
  g1.addColorStop(0, accent);
  g1.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, width, height);

  const g2 = ctx.createRadialGradient(980, 380, 10, 980, 380, 360);
  g2.addColorStop(0, accent);
  g2.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  drawGrid(ctx, width, height);
  drawNoise(ctx, width, height);

  // Outer card frame
  glowRect(ctx, 20, 20, width - 40, height - 40, 28, accent, 30, 0.32);
  fillRoundRect(ctx, 20, 20, width - 40, height - 40, 28, "rgba(255,255,255,0.06)");
  strokeRoundRect(ctx, 20, 20, width - 40, height - 40, 28, "rgba(255,255,255,0.10)", 1);

  // Header bar
  fillRoundRect(ctx, 40, 40, width - 80, 76, 22, "rgba(0,0,0,0.35)");
  strokeRoundRect(ctx, 40, 40, width - 80, 76, 22, "rgba(255,255,255,0.10)", 1);

  // Title left
  ctx.font = "bold 26px RobotoBold";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText("M33NIX // RANK LICENSE", 64, 88);

  // Small subtitle
  ctx.font = "16px Roboto";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillText("Hunter Access Card • Secure ID", 64, 110);

  // License (right side in header)
  const licBoxX = width - 440;
  const licBoxY = 56;
  const licBoxW = 240;
  const licBoxH = 44;

  glowRect(ctx, licBoxX, licBoxY, licBoxW, licBoxH, 14, accent, 22, 0.28);
  fillRoundRect(ctx, licBoxX, licBoxY, licBoxW, licBoxH, 14, "rgba(255,255,255,0.08)");
  strokeRoundRect(ctx, licBoxX, licBoxY, licBoxW, licBoxH, 14, "rgba(255,255,255,0.12)", 1);

  ctx.font = "bold 14px RobotoBold";
  ctx.fillStyle = "rgba(255,255,255,0.60)";
  ctx.fillText("LICENSE", licBoxX + 14, licBoxY + 18);

  ctx.font = "20px Roboto";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText(licenseNo, licBoxX + 14, licBoxY + 38);

  // Rank badge (far right)
  const rankX = width - 176;
  const rankY = 52;
  const rankW = 96;
  const rankH = 52;

  glowRect(ctx, rankX, rankY, rankW, rankH, 16, accent, 28, 0.40);
  fillRoundRect(ctx, rankX, rankY, rankW, rankH, 16, "rgba(255,255,255,0.10)");
  strokeRoundRect(ctx, rankX, rankY, rankW, rankH, 16, "rgba(255,255,255,0.14)", 1);

  ctx.font = "bold 14px RobotoBold";
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillText("RANK", rankX + 18, rankY + 18);

  ctx.font = "bold 28px RobotoBold";
  ctx.fillStyle = accent;
  ctx.fillText(rank, rankX + 40, rankY + 44);

  // ─────────────────────────────────────────
  // Body layout
  // ─────────────────────────────────────────
  const leftX = 58;
  const topY = 140;

  // Avatar panel
  const avatarPanelX = leftX;
  const avatarPanelY = topY;
  const avatarPanelW = 300;
  const avatarPanelH = 330;

  glowRect(ctx, avatarPanelX, avatarPanelY, avatarPanelW, avatarPanelH, 26, accent, 26, 0.30);
  fillRoundRect(ctx, avatarPanelX, avatarPanelY, avatarPanelW, avatarPanelH, 26, "rgba(0,0,0,0.35)");
  strokeRoundRect(ctx, avatarPanelX, avatarPanelY, avatarPanelW, avatarPanelH, 26, "rgba(255,255,255,0.10)", 1);

  // Avatar image clipped with rounded rect
  const avatarX = avatarPanelX + 18;
  const avatarY = avatarPanelY + 18;
  const avatarW = avatarPanelW - 36;
  const avatarH = avatarPanelH - 36;

  // inner neon border
  strokeRoundRect(ctx, avatarX - 2, avatarY - 2, avatarW + 4, avatarH + 4, 20, accent, 3);

  try {
    const avatar = await loadImage(user.avatar);
    ctx.save();
    roundRect(ctx, avatarX, avatarY, avatarW, avatarH, 18);
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarW, avatarH);
    ctx.restore();
  } catch {
    // fallback empty
    ctx.font = "16px Roboto";
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillText("No avatar", avatarX + 12, avatarY + 28);
  }

  // Right info panel
  const infoX = avatarPanelX + avatarPanelW + 26;
  const infoY = topY;
  const infoW = width - infoX - 58;
  const infoH = avatarPanelH;

  fillRoundRect(ctx, infoX, infoY, infoW, infoH, 26, "rgba(255,255,255,0.06)");
  strokeRoundRect(ctx, infoX, infoY, infoW, infoH, 26, "rgba(255,255,255,0.10)", 1);

  // Big faint rank watermark
  ctx.save();
  ctx.globalAlpha = 0.10;
  ctx.font = "220px RobotoBold";
  ctx.fillStyle = accent;
  ctx.fillText(rank, infoX + infoW - 220, infoY + 240);
  ctx.restore();

  // Field cards
  function fieldRow(label, value, x, y, w, h) {
    // Glass tile
    fillRoundRect(ctx, x, y, w, h, 18, "rgba(0,0,0,0.35)");
    strokeRoundRect(ctx, x, y, w, h, 18, "rgba(255,255,255,0.10)", 1);
    // Accent bar
    ctx.save();
    ctx.globalAlpha = 0.95;
    fillRoundRect(ctx, x + 10, y + 10, 6, h - 20, 6, accent);
    ctx.restore();

    // Label (bold)
    ctx.font = "bold 16px RobotoBold";
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.fillText(label.toUpperCase(), x + 28, y + 26);

    // Value (normal, auto fit)
    const maxW = w - 56;
    const v = value == null ? "" : String(value);
    const size = fitText(ctx, v, maxW, 34, 20, "Roboto", "");
    ctx.font = `${size}px Roboto`;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillText(v, x + 28, y + 62);
  }

  // Data
  const name = user?.thmUsername ?? "Unknown";
  const team = DEFAULT_TEAM;
  const ctf = DEFAULT_CTFS;

  // Rows positions
  const pad = 22;
  const rowW = infoW - pad * 2;
  const rowH = 86;

  fieldRow("Name", name, infoX + pad, infoY + 24, rowW, rowH);
  fieldRow("Category", category, infoX + pad, infoY + 24 + rowH + 16, rowW, rowH);

  // Team + CTF split
  const halfGap = 16;
  const halfW = (rowW - halfGap) / 2;
  fieldRow("Team", team, infoX + pad, infoY + 24 + (rowH + 16) * 2, halfW, rowH);
  fieldRow("CTF", ctf, infoX + pad + halfW + halfGap, infoY + 24 + (rowH + 16) * 2, halfW, rowH);

  // Footer tagline
  ctx.font = "14px Roboto";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillText(
    "Certified • Verified • Encrypted — Generated by rank-bot",
    64,
    height - 44
  );

  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
