const { createCanvas, loadImage, registerFont } = require("canvas");
const path = require("path");

// Fonts
registerFont(path.join(__dirname, "../fonts/Roboto-Bold.ttf"), { family: "RobotoBold" });
registerFont(path.join(__dirname, "../fonts/Roboto-Regular.ttf"), { family: "Roboto" });

// BG image (download Solo wallpaper and save locally)
const BG_IMAGE_PATH = path.join(__dirname, "../assets/solo-bg.jpg");

// Optional watermark logo (direct .png/.jpg URL or local path)
const WATERMARK_LOGO = process.env.BG_LOGO_URL || "";
const WATERMARK_OPACITY = 0.06;

const DEFAULT_TEAM = "morvax60";
const DEFAULT_CTFS = "10";

// Theme (mid, premium)
const C = {
  white: "rgba(255,255,255,0.92)",
  dim: "rgba(255,255,255,0.62)",
  faint: "rgba(255,255,255,0.14)",
  faint2: "rgba(255,255,255,0.08)",
  panel: "rgba(8,10,16,0.68)",
  panel2: "rgba(8,10,16,0.52)",
  deep: "rgba(0,0,0,0.70)",
};

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

function getCategory(rank) {
  switch (rank) {
    case "S": return "Monarch";
    case "A": return "Shadow Adept";
    case "B": return "Elite Hunter";
    case "C": return "Hunter";
    case "D": return "Rookie";
    default:  return "Unawakened";
  }
}

// Minimal rank accent (still subtle)
function getRankAccent(rank) {
  switch (rank) {
    case "S": return "rgba(255,255,255,0.95)";
    case "A": return "rgba(255,255,255,0.92)";
    case "B": return "rgba(255,255,255,0.86)";
    default:  return "rgba(255,255,255,0.80)";
  }
}

// ─────────────────────────────────────────
// DRAW HELPERS
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

function fillR(ctx, x, y, w, h, r, fillStyle) {
  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.restore();
}

function strokeR(ctx, x, y, w, h, r, strokeStyle, lineWidth = 1) {
  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.restore();
}

function drawImageCover(ctx, img, x, y, w, h) {
  const iw = img.width;
  const ih = img.height;
  const scale = Math.max(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function fitText(ctx, text, maxWidth, startSize, minSize, family, weight = "") {
  const t = text == null ? "" : String(text);
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${weight}${weight ? " " : ""}${size}px ${family}`;
    if (ctx.measureText(t).width <= maxWidth) return size;
    size -= 1;
  }
  return minSize;
}

async function drawWatermark(ctx, w, h, urlOrPath, opacity = 0.06) {
  if (!urlOrPath) return;
  try {
    const img = await loadImage(urlOrPath);
    const targetW = w * 0.46;
    const scale = targetW / img.width;
    const dw = img.width * scale;
    const dh = img.height * scale;
    const x = (w - dw) / 2;
    const y = (h - dh) / 2;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.shadowColor = "rgba(0,0,0,0.9)";
    ctx.shadowBlur = 18;
    ctx.drawImage(img, x, y, dw, dh);
    ctx.restore();
  } catch {}
}

function drawNoise(ctx, w, h, amount = 5200) {
  ctx.save();
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < amount; i++) {
    const x = (Math.random() * w) | 0;
    const y = (Math.random() * h) | 0;
    const a = Math.random() * 0.7;
    ctx.fillStyle = `rgba(0,0,0,${a})`;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();
}

function divider(ctx, x1, x2, y) {
  ctx.save();
  ctx.strokeStyle = C.faint2;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
  ctx.restore();
}

function drawLabelValue(ctx, label, value, x, y, w) {
  // label (small, bold)
  ctx.font = "bold 12px RobotoBold";
  ctx.fillStyle = C.dim;
  ctx.fillText(label.toUpperCase(), x, y);

  // value (normal)
  const v = value == null ? "" : String(value);
  const size = fitText(ctx, v, w, 34, 18, "Roboto", "");
  ctx.font = `${size}px Roboto`;
  ctx.fillStyle = C.white;
  ctx.fillText(v, x, y + 34);
}

function drawAvatarPanel(ctx, x, y, w, h, avatarImg) {
  // panel
  fillR(ctx, x, y, w, h, 22, "rgba(255,255,255,0.04)");
  strokeR(ctx, x, y, w, h, 22, C.faint, 1);

  // inner frame
  strokeR(ctx, x + 14, y + 14, w - 28, h - 28, 18, "rgba(255,255,255,0.24)", 1);

  // draw avatar (cover)
  const ax = x + 18;
  const ay = y + 18;
  const aw = w - 36;
  const ah = h - 36;

  ctx.save();
  roundRect(ctx, ax, ay, aw, ah, 16);
  ctx.clip();

  if (avatarImg) {
    // slight zoom to feel “OP”
    const zoom = 1.06;
    const zx = ax - (aw * (zoom - 1)) / 2;
    const zy = ay - (ah * (zoom - 1)) / 2;
    const zw = aw * zoom;
    const zh = ah * zoom;
    drawImageCover(ctx, avatarImg, zx, zy, zw, zh);
  } else {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(ax, ay, aw, ah);
  }

  // subtle vignette
  const vign = ctx.createRadialGradient(ax + aw / 2, ay + ah / 2, aw * 0.2, ax + aw / 2, ay + ah / 2, aw * 0.85);
  vign.addColorStop(0, "rgba(0,0,0,0)");
  vign.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vign;
  ctx.fillRect(ax, ay, aw, ah);

  // top shine
  const shine = ctx.createLinearGradient(ax, ay, ax, ay + ah * 0.55);
  shine.addColorStop(0, "rgba(255,255,255,0.10)");
  shine.addColorStop(1, "rgba(255,255,255,0.00)");
  ctx.fillStyle = shine;
  ctx.fillRect(ax, ay, aw, ah);

  ctx.restore();
}

// ─────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────
async function generateCard(user) {
  const width = 1220;
  const height = 640;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const points = user?.points ?? 0;
  const licenseNo = String(points).padStart(10, "0");
  const rank = getRank(points);
  const category = getCategory(rank);
  const rankAccent = getRankAccent(rank);

  // Load BG
  let bgImg = null;
  try { bgImg = await loadImage(BG_IMAGE_PATH); } catch { bgImg = null; }

  if (bgImg) drawImageCover(ctx, bgImg, 0, 0, width, height);
  else {
    ctx.fillStyle = "#05060D";
    ctx.fillRect(0, 0, width, height);
  }

  // Dark overlay to unify colors
  ctx.save();
  const ov = ctx.createLinearGradient(0, 0, width, height);
  ov.addColorStop(0, "rgba(0,0,0,0.80)");
  ov.addColorStop(0.55, "rgba(0,0,0,0.62)");
  ov.addColorStop(1, "rgba(0,0,0,0.82)");
  ctx.fillStyle = ov;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // Watermark logo (optional)
  await drawWatermark(ctx, width, height, WATERMARK_LOGO, WATERMARK_OPACITY);

  // Grain
  drawNoise(ctx, width, height, 5200);

  // Main “dossier” shell (new style)
  const shellX = 36, shellY = 36, shellW = width - 72, shellH = height - 72;
  fillR(ctx, shellX, shellY, shellW, shellH, 28, "rgba(255,255,255,0.03)");
  strokeR(ctx, shellX, shellY, shellW, shellH, 28, "rgba(255,255,255,0.16)", 1);

  // Top bar (thin, modern)
  const topX = shellX + 18;
  const topY = shellY + 18;
  const topW = shellW - 36;
  const topH = 74;

  fillR(ctx, topX, topY, topW, topH, 22, C.panel);
  strokeR(ctx, topX, topY, topW, topH, 22, C.faint, 1);

  // Title
  ctx.font = "bold 30px RobotoBold";
  ctx.fillStyle = C.white;
  ctx.fillText("HUNTER CARD", topX + 22, topY + 48);

  // Right: ID + Rank (new look)
  const badgeH = 46;
  const badgeY = topY + 14;

  // Rank badge
  const rankW = 92;
  const rankX = topX + topW - rankW - 18;
  fillR(ctx, rankX, badgeY, rankW, badgeH, 14, "rgba(0,0,0,0.70)");
  strokeR(ctx, rankX, badgeY, rankW, badgeH, 14, C.faint, 1);

  ctx.font = "bold 11px RobotoBold";
  ctx.fillStyle = C.dim;
  ctx.fillText("RANK", rankX + 14, badgeY + 18);

  ctx.font = "bold 26px RobotoBold";
  ctx.fillStyle = rankAccent;
  ctx.fillText(rank, rankX + 58, badgeY + 36);

  // ID badge
  const idW = 210;
  const idX = rankX - 12 - idW;
  fillR(ctx, idX, badgeY, idW, badgeH, 14, "rgba(0,0,0,0.70)");
  strokeR(ctx, idX, badgeY, idW, badgeH, 14, C.faint, 1);

  ctx.font = "bold 11px RobotoBold";
  ctx.fillStyle = C.dim;
  ctx.fillText("ID", idX + 14, badgeY + 18);

  ctx.font = "16px Roboto";
  ctx.fillStyle = C.white;
  ctx.fillText(licenseNo, idX + 14, badgeY + 36);

  // Content area (NEW layout)
  const contentX = shellX + 18;
  const contentY = topY + topH + 16;
  const contentW = shellW - 36;
  const contentH = shellH - (topH + 18 + 16);

  fillR(ctx, contentX, contentY, contentW, contentH, 26, C.panel2);
  strokeR(ctx, contentX, contentY, contentW, contentH, 26, C.faint2, 1);

  // Left: big avatar column (portrait)
  const leftW = 430;
  const leftX = contentX + 18;
  const leftY = contentY + 18;
  const leftH = contentH - 36;

  // Load avatar once
  let avatarImg = null;
  try { avatarImg = await loadImage(user.avatar); } catch { avatarImg = null; }

  drawAvatarPanel(ctx, leftX, leftY, leftW, leftH, avatarImg);

  // Right: dossier rows
  const rightX = leftX + leftW + 22;
  const rightY = leftY;
  const rightW = contentX + contentW - rightX - 18;
  const rightH = leftH;

  // Right panel
  fillR(ctx, rightX, rightY, rightW, rightH, 22, "rgba(0,0,0,0.40)");
  strokeR(ctx, rightX, rightY, rightW, rightH, 22, C.faint2, 1);

  // Inner padding
  const px = rightX + 26;
  let cy = rightY + 28;
  const rowW = rightW - 52;

  // Row 1: NAME
  drawLabelValue(ctx, "Name", user?.thmUsername ?? "Unknown", px, cy, rowW);
  cy += 74;
  divider(ctx, px, px + rowW, cy);
  cy += 22;

  // Row 2: CATEGORY
  drawLabelValue(ctx, "Category", category, px, cy, rowW);
  cy += 74;
  divider(ctx, px, px + rowW, cy);
  cy += 22;

  // Row 3: TEAM + CTF (2 columns)
  const colGap = 22;
  const colW = (rowW - colGap) / 2;

  drawLabelValue(ctx, "Team", DEFAULT_TEAM, px, cy, colW);
  drawLabelValue(ctx, "CTF", DEFAULT_CTFS, px + colW + colGap, cy, colW);
  cy += 74;
  divider(ctx, px, px + rowW, cy);
  cy += 22;

  // Row 4: POWER (points) + progress line (subtle)
  drawLabelValue(ctx, "Power", String(points), px, cy, rowW);
  cy += 62;

  // Progress bar (subtle)
  const barX = px;
  const barY = cy;
  const barW = rowW;
  const barH = 10;

  fillR(ctx, barX, barY, barW, barH, 10, "rgba(255,255,255,0.08)");

  // Fill percent towards next tier (nice touch, mid)
  const tiers = [0, 10000, 20000, 50000, 100000, 150000];
  let next = 150000, prev = 0;
  for (let i = 0; i < tiers.length; i++) {
    if (points < tiers[i]) { next = tiers[i]; prev = tiers[Math.max(0, i - 1)]; break; }
  }
  const pct = next === prev ? 1 : Math.max(0, Math.min(1, (points - prev) / (next - prev)));
  fillR(ctx, barX, barY, Math.max(10, barW * pct), barH, 10, "rgba(255,255,255,0.32)");

  // Footer tiny text (minimal)
  ctx.font = "12px Roboto";
  ctx.fillStyle = C.dim;
  ctx.fillText("STATUS: VERIFIED", leftX + 24, leftY + leftH - 22);

  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
