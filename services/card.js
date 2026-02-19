// card.js (Solo Leveling BG + clean UI)
// ✅ Uses a Solo Leveling background image (local file recommended)
// ✅ Heading ONLY "HUNTER CARD"
// ✅ Center watermark logo (opacity 0.10)
// ✅ Dark overlay for readability
// ✅ Labels bold, values normal
// ✅ Auto-fit long names

const { createCanvas, loadImage, registerFont } = require("canvas");
const path = require("path");

// Fonts
registerFont(path.join(__dirname, "../fonts/Roboto-Bold.ttf"), { family: "RobotoBold" });
registerFont(path.join(__dirname, "../fonts/Roboto-Regular.ttf"), { family: "Roboto" });

// ─────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────

// 1) Download your Solo Leveling bg and put it here:
const BG_IMAGE_PATH = path.join(__dirname, "../assets/solo-bg.jpg");

// 2) Your logo watermark (put direct image URL or local path).
//    Example direct png url: https://.../logo.png
const WATERMARK_LOGO = process.env.BG_LOGO_URL || ""; // optional
const WATERMARK_OPACITY = 0.10; // 10%

// Solo-ish accent colors (you can tweak)
const UI_ACCENT = "#8b5cf6";   // purple
const UI_ACCENT_2 = "#38bdf8"; // blue
const TEXT_MAIN = "rgba(255,255,255,0.92)";
const TEXT_DIM = "rgba(255,255,255,0.60)";

// Defaults
const DEFAULT_TEAM = "morvax60";
const DEFAULT_CTFS = "10";

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

// Rank-based accent (still matches Solo vibe)
function getRankAccent(rank) {
  switch (rank) {
    case "S": return "#ff2a6d";
    case "A": return "#8b5cf6";
    case "B": return "#38bdf8";
    case "C": return "#22c55e";
    case "D": return "#f59e0b";
    default:  return "#94a3b8";
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

function glowR(ctx, x, y, w, h, r, glowColor, blur = 28, alpha = 0.28) {
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

// CSS-like object-fit: cover
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

function fitText(ctx, text, maxWidth, startSize, minSize, fontFamily, weight = "") {
  const t = text == null ? "" : String(text);
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${weight}${weight ? " " : ""}${size}px ${fontFamily}`;
    if (ctx.measureText(t).width <= maxWidth) return size;
    size -= 1;
  }
  return minSize;
}

async function drawWatermark(ctx, canvasW, canvasH, urlOrPath, opacity = 0.1) {
  if (!urlOrPath) return;
  try {
    const img = await loadImage(urlOrPath);
    const targetW = canvasW * 0.42; // watermark size
    const scale = targetW / img.width;
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (canvasW - w) / 2;
    const y = (canvasH - h) / 2;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.shadowColor = "rgba(0,0,0,0.65)";
    ctx.shadowBlur = 28;
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  } catch {}
}

function fieldTile(ctx, label, value, x, y, w, h, accent) {
  glowR(ctx, x, y, w, h, 18, accent, 18, 0.22);
  fillR(ctx, x, y, w, h, 18, "rgba(0,0,0,0.40)");
  strokeR(ctx, x, y, w, h, 18, "rgba(255,255,255,0.12)", 1);

  // left accent bar
  fillR(ctx, x + 12, y + 12, 6, h - 24, 6, accent);

  // label (bold)
  ctx.font = "bold 14px RobotoBold";
  ctx.fillStyle = TEXT_DIM;
  ctx.fillText(label.toUpperCase(), x + 28, y + 28);

  // value (normal)
  const v = value == null ? "" : String(value);
  const size = fitText(ctx, v, w - 46, 34, 18, "Roboto", "");
  ctx.font = `${size}px Roboto`;
  ctx.fillStyle = TEXT_MAIN;
  ctx.fillText(v, x + 28, y + 64);
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
  const rankAccent = getRankAccent(rank);
  const category = getCategory(rank);

  // ── Background image (Solo)
  let bgImg = null;
  try {
    bgImg = await loadImage(BG_IMAGE_PATH);
  } catch {
    bgImg = null;
  }

  if (bgImg) {
    drawImageCover(ctx, bgImg, 0, 0, width, height);
  } else {
    // fallback if bg missing
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, "#05060D");
    g.addColorStop(1, "#0b0f25");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }

  // dark overlay for readability
  ctx.save();
  const overlay = ctx.createLinearGradient(0, 0, width, height);
  overlay.addColorStop(0, "rgba(0,0,0,0.70)");
  overlay.addColorStop(0.55, "rgba(0,0,0,0.55)");
  overlay.addColorStop(1, "rgba(0,0,0,0.72)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // subtle aura glow
  ctx.save();
  ctx.globalAlpha = 0.22;
  const aura = ctx.createRadialGradient(330, 220, 20, 330, 220, 420);
  aura.addColorStop(0, rankAccent);
  aura.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // watermark logo in middle (optional)
  await drawWatermark(ctx, width, height, WATERMARK_LOGO, WATERMARK_OPACITY);

  // ── Outer frame
  glowR(ctx, 22, 22, width - 44, height - 44, 28, rankAccent, 34, 0.30);
  fillR(ctx, 22, 22, width - 44, height - 44, 28, "rgba(255,255,255,0.04)");
  strokeR(ctx, 22, 22, width - 44, height - 44, 28, "rgba(255,255,255,0.10)", 1);

  // ── Header
  const headerX = 46;
  const headerY = 46;
  const headerW = width - 92;
  const headerH = 86;

  fillR(ctx, headerX, headerY, headerW, headerH, 22, "rgba(0,0,0,0.45)");
  strokeR(ctx, headerX, headerY, headerW, headerH, 22, "rgba(255,255,255,0.12)", 1);

  // Heading ONLY
  ctx.font = "bold 32px RobotoBold";
  ctx.fillStyle = TEXT_MAIN;
  ctx.fillText("HUNTER CARD", headerX + 22, headerY + 55);

  // License box
  const licW = 320, licH = 54;
  const licX = headerX + headerW - (licW + 190);
  const licY = headerY + 16;

  glowR(ctx, licX, licY, licW, licH, 16, UI_ACCENT, 22, 0.18);
  fillR(ctx, licX, licY, licW, licH, 16, "rgba(255,255,255,0.06)");
  strokeR(ctx, licX, licY, licW, licH, 16, "rgba(255,255,255,0.12)", 1);

  fillR(ctx, licX + 12, licY + 12, 6, licH - 24, 6, UI_ACCENT_2);

  ctx.font = "bold 12px RobotoBold";
  ctx.fillStyle = TEXT_DIM;
  ctx.fillText("LICENSE", licX + 26, licY + 20);

  ctx.font = "20px Roboto";
  ctx.fillStyle = TEXT_MAIN;
  ctx.fillText(licenseNo, licX + 26, licY + 44);

  // Rank box
  const rW = 170, rH = 54;
  const rX = headerX + headerW - rW - 18;
  const rY = headerY + 16;

  glowR(ctx, rX, rY, rW, rH, 16, rankAccent, 26, 0.30);
  fillR(ctx, rX, rY, rW, rH, 16, "rgba(255,255,255,0.06)");
  strokeR(ctx, rX, rY, rW, rH, 16, "rgba(255,255,255,0.12)", 1);

  ctx.font = "bold 12px RobotoBold";
  ctx.fillStyle = TEXT_DIM;
  ctx.fillText("RANK", rX + 20, rY + 20);

  ctx.font = "bold 26px RobotoBold";
  ctx.fillStyle = rankAccent;
  ctx.fillText(rank, rX + 112, rY + 44);

  // ── Body panels
  const bodyX = 46, bodyY = 150, bodyW = width - 92, bodyH = height - 200;

  fillR(ctx, bodyX, bodyY, bodyW, bodyH, 26, "rgba(0,0,0,0.40)");
  strokeR(ctx, bodyX, bodyY, bodyW, bodyH, 26, "rgba(255,255,255,0.12)", 1);

  // Avatar panel
  const avPanelX = bodyX + 22;
  const avPanelY = bodyY + 22;
  const avPanelW = 360;
  const avPanelH = bodyH - 44;

  glowR(ctx, avPanelX, avPanelY, avPanelW, avPanelH, 24, rankAccent, 26, 0.25);
  fillR(ctx, avPanelX, avPanelY, avPanelW, avPanelH, 24, "rgba(255,255,255,0.05)");
  strokeR(ctx, avPanelX, avPanelY, avPanelW, avPanelH, 24, "rgba(255,255,255,0.12)", 1);

  const avatarX = avPanelX + 18;
  const avatarY = avPanelY + 18;
  const avatarW = avPanelW - 36;
  const avatarH = avatarW;

  glowR(ctx, avatarX - 6, avatarY - 6, avatarW + 12, avatarH + 12, 22, rankAccent, 30, 0.32);
  strokeR(ctx, avatarX - 2, avatarY - 2, avatarW + 4, avatarH + 4, 20, rankAccent, 3);
  fillR(ctx, avatarX, avatarY, avatarW, avatarH, 18, "rgba(0,0,0,0.35)");

  try {
    const avatar = await loadImage(user.avatar);
    ctx.save();
    roundRect(ctx, avatarX, avatarY, avatarW, avatarH, 18);
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarW, avatarH);
    ctx.restore();
  } catch {}

  // Info panel (right)
  const infoX = avPanelX + avPanelW + 22;
  const infoY = avPanelY;
  const infoW = bodyX + bodyW - infoX - 22;
  const infoH = avPanelH;

  fillR(ctx, infoX, infoY, infoW, infoH, 24, "rgba(255,255,255,0.04)");
  strokeR(ctx, infoX, infoY, infoW, infoH, 24, "rgba(255,255,255,0.12)", 1);

  const pad = 22;
  const tileW = infoW - pad * 2;
  const tileH = 90;

  const name = user?.thmUsername ?? "Unknown";
  const team = DEFAULT_TEAM;
  const ctf = DEFAULT_CTFS;

  fieldTile(ctx, "Name", name, infoX + pad, infoY + 26, tileW, tileH, UI_ACCENT_2);
  fieldTile(ctx, "Category", category, infoX + pad, infoY + 26 + tileH + 16, tileW, tileH, UI_ACCENT);

  const gap = 16;
  const halfW = (tileW - gap) / 2;
  fieldTile(ctx, "Team", team, infoX + pad, infoY + 26 + (tileH + 16) * 2, halfW, tileH, UI_ACCENT_2);
  fieldTile(ctx, "CTF", ctf, infoX + pad + halfW + gap, infoY + 26 + (tileH + 16) * 2, halfW, tileH, UI_ACCENT);

  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
