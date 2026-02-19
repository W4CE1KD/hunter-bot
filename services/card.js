// card.js — MONO DARK UI (Black/White) + Solo BG
// ✅ No neon, no colored glow (only black/white)
// ✅ Keep BG image: assets/solo-bg.jpg
// ✅ OP avatar size
// ✅ Heading only: HUNTER CARD
// ✅ Compact LICENSE + RANK (monochrome)

const { createCanvas, loadImage, registerFont } = require("canvas");
const path = require("path");

registerFont(path.join(__dirname, "../fonts/Roboto-Bold.ttf"), { family: "RobotoBold" });
registerFont(path.join(__dirname, "../fonts/Roboto-Regular.ttf"), { family: "Roboto" });

// BG image (download and save locally)
const BG_IMAGE_PATH = path.join(__dirname, "../assets/solo-bg.jpg");

// Optional center watermark logo (still monochrome-ish; set opacity low)
const WATERMARK_LOGO = process.env.BG_LOGO_URL || "";
const WATERMARK_OPACITY = 0.08;

const DEFAULT_TEAM = "morvax60";
const DEFAULT_CTFS = "10";

// Colors (ONLY B/W)
const WHITE = "rgba(255,255,255,0.92)";
const WHITE_DIM = "rgba(255,255,255,0.60)";
const WHITE_FAINT = "rgba(255,255,255,0.12)";
const WHITE_LINE = "rgba(255,255,255,0.18)";
const PANEL = "rgba(0,0,0,0.62)";
const PANEL_2 = "rgba(0,0,0,0.48)";

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

// object-fit: cover
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

async function drawWatermark(ctx, canvasW, canvasH, urlOrPath, opacity = 0.08) {
  if (!urlOrPath) return;
  try {
    const img = await loadImage(urlOrPath);
    const targetW = canvasW * 0.42;
    const scale = targetW / img.width;
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (canvasW - w) / 2;
    const y = (canvasH - h) / 2;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.shadowColor = "rgba(0,0,0,0.9)";
    ctx.shadowBlur = 18;
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  } catch {}
}

function fieldTile(ctx, label, value, x, y, w, h) {
  fillR(ctx, x, y, w, h, 16, PANEL_2);
  strokeR(ctx, x, y, w, h, 16, WHITE_FAINT, 1);

  // tiny left bar (white only)
  fillR(ctx, x + 12, y + 12, 5, h - 24, 5, "rgba(255,255,255,0.55)");

  // label bold
  ctx.font = "bold 13px RobotoBold";
  ctx.fillStyle = WHITE_DIM;
  ctx.fillText(label.toUpperCase(), x + 26, y + 26);

  // value normal auto-fit
  const v = value == null ? "" : String(value);
  const size = fitText(ctx, v, w - 40, 32, 18, "Roboto", "");
  ctx.font = `${size}px Roboto`;
  ctx.fillStyle = WHITE;
  ctx.fillText(v, x + 26, y + 62);
}

function drawOPAvatarBW(ctx, x, y, w, h) {
  // Strong white frame, no glow
  strokeR(ctx, x - 6, y - 6, w + 12, h + 12, 22, "rgba(255,255,255,0.45)", 2);
  strokeR(ctx, x - 2, y - 2, w + 4, h + 4, 18, "rgba(255,255,255,0.22)", 1);

  // inner vignette overlay (gives "OP" depth, no neon)
  ctx.save();
  roundRect(ctx, x, y, w, h, 18);
  ctx.clip();

  const vign = ctx.createRadialGradient(x + w / 2, y + h / 2, w * 0.15, x + w / 2, y + h / 2, w * 0.75);
  vign.addColorStop(0, "rgba(0,0,0,0)");
  vign.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vign;
  ctx.fillRect(x, y, w, h);

  // subtle top shine
  const shine = ctx.createLinearGradient(x, y, x, y + h * 0.6);
  shine.addColorStop(0, "rgba(255,255,255,0.10)");
  shine.addColorStop(1, "rgba(255,255,255,0.00)");
  ctx.fillStyle = shine;
  ctx.fillRect(x, y, w, h);

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

  // BG
  let bgImg = null;
  try { bgImg = await loadImage(BG_IMAGE_PATH); } catch { bgImg = null; }

  if (bgImg) drawImageCover(ctx, bgImg, 0, 0, width, height);
  else {
    ctx.fillStyle = "#05060D";
    ctx.fillRect(0, 0, width, height);
  }

  // Heavy dark overlay (to kill colors, keep bg visible)
  ctx.save();
  const overlay = ctx.createLinearGradient(0, 0, width, height);
  overlay.addColorStop(0, "rgba(0,0,0,0.78)");
  overlay.addColorStop(0.55, "rgba(0,0,0,0.62)");
  overlay.addColorStop(1, "rgba(0,0,0,0.80)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // Optional watermark logo
  await drawWatermark(ctx, width, height, WATERMARK_LOGO, WATERMARK_OPACITY);

  // Outer frame (white only)
  fillR(ctx, 22, 22, width - 44, height - 44, 28, "rgba(255,255,255,0.03)");
  strokeR(ctx, 22, 22, width - 44, height - 44, 28, WHITE_LINE, 1);

  // Header
  const headerX = 46, headerY = 46, headerW = width - 92, headerH = 86;
  fillR(ctx, headerX, headerY, headerW, headerH, 22, PANEL);
  strokeR(ctx, headerX, headerY, headerW, headerH, 22, WHITE_FAINT, 1);

  ctx.font = "bold 32px RobotoBold";
  ctx.fillStyle = WHITE;
  ctx.fillText("HUNTER CARD", headerX + 22, headerY + 55);

  // Top-right badges (monochrome)
  const badgeH = 54;
  const badgeTop = headerY + 16;
  const badgeRight = headerX + headerW - 18;
  const pad = 14;

  // Rank badge
  const rankW = 110;
  const rX = badgeRight - rankW;
  const rY = badgeTop;

  fillR(ctx, rX, rY, rankW, badgeH, 16, "rgba(0,0,0,0.65)");
  strokeR(ctx, rX, rY, rankW, badgeH, 16, WHITE_FAINT, 1);
  fillR(ctx, rX + 12, rY + 10, rankW - 24, 4, 4, "rgba(255,255,255,0.10)");

  ctx.font = "bold 11px RobotoBold";
  ctx.fillStyle = WHITE_DIM;
  ctx.fillText("RANK", rX + 14, rY + 22);

  ctx.font = "bold 30px RobotoBold";
  ctx.fillStyle = WHITE;
  ctx.fillText(rank, rX + 64, rY + 44);

  // License badge
  const licW = 170;
  const lX = rX - pad - licW;
  const lY = badgeTop;

  fillR(ctx, lX, lY, licW, badgeH, 16, "rgba(0,0,0,0.65)");
  strokeR(ctx, lX, lY, licW, badgeH, 16, WHITE_FAINT, 1);
  fillR(ctx, lX + 12, lY + 12, 5, badgeH - 24, 5, "rgba(255,255,255,0.55)");

  ctx.font = "bold 11px RobotoBold";
  ctx.fillStyle = WHITE_DIM;
  ctx.fillText("LICENSE", lX + 26, lY + 22);

  ctx.font = "16px Roboto";
  ctx.fillStyle = WHITE;
  ctx.fillText(licenseNo, lX + 26, lY + 44);

  // Body
  const bodyX = 46, bodyY = 150, bodyW = width - 92, bodyH = height - 200;
  fillR(ctx, bodyX, bodyY, bodyW, bodyH, 26, PANEL);
  strokeR(ctx, bodyX, bodyY, bodyW, bodyH, 26, WHITE_FAINT, 1);

  // Avatar panel (bigger)
  const avPanelX = bodyX + 22;
  const avPanelY = bodyY + 22;
  const avPanelW = 430;
  const avPanelH = bodyH - 44;

  fillR(ctx, avPanelX, avPanelY, avPanelW, avPanelH, 24, "rgba(255,255,255,0.04)");
  strokeR(ctx, avPanelX, avPanelY, avPanelW, avPanelH, 24, WHITE_FAINT, 1);

  const avatarPadding = 16;
  const avatarX = avPanelX + avatarPadding;
  const avatarY = avPanelY + avatarPadding;
  const avatarW = avPanelW - avatarPadding * 2;
  const avatarH = avatarW;

  // avatar image (cover + zoom)
  try {
    const avatar = await loadImage(user.avatar);
    ctx.save();
    roundRect(ctx, avatarX, avatarY, avatarW, avatarH, 18);
    ctx.clip();

    const zoom = 1.08;
    const zx = avatarX - (avatarW * (zoom - 1)) / 2;
    const zy = avatarY - (avatarH * (zoom - 1)) / 2;
    const zw = avatarW * zoom;
    const zh = avatarH * zoom;

    drawImageCover(ctx, avatar, zx, zy, zw, zh);
    ctx.restore();
  } catch {
    fillR(ctx, avatarX, avatarY, avatarW, avatarH, 18, "rgba(0,0,0,0.35)");
  }

  // OP avatar treatment (BW only)
  drawOPAvatarBW(ctx, avatarX, avatarY, avatarW, avatarH);

  // Smooth bottom fade (BW)
  ctx.save();
  roundRect(ctx, avatarX, avatarY, avatarW, avatarH, 18);
  ctx.clip();
  const fadeTop = avatarY + avatarH * 0.70;
  const fade = ctx.createLinearGradient(avatarX, fadeTop, avatarX, avatarY + avatarH);
  fade.addColorStop(0.0, "rgba(0,0,0,0.00)");
  fade.addColorStop(0.35, "rgba(0,0,0,0.18)");
  fade.addColorStop(0.70, "rgba(0,0,0,0.40)");
  fade.addColorStop(1.0, "rgba(0,0,0,0.62)");
  ctx.fillStyle = fade;
  ctx.fillRect(avatarX, avatarY, avatarW, avatarH);
  ctx.restore();

  // Info panel
  const infoX = avPanelX + avPanelW + 22;
  const infoY = avPanelY;
  const infoW = bodyX + bodyW - infoX - 22;
  const infoH = avPanelH;

  fillR(ctx, infoX, infoY, infoW, infoH, 24, "rgba(255,255,255,0.04)");
  strokeR(ctx, infoX, infoY, infoW, infoH, 24, WHITE_FAINT, 1);

  const pad2 = 22;
  const tileW = infoW - pad2 * 2;
  const tileH = 90;

  const name = user?.thmUsername ?? "Unknown";
  const team = DEFAULT_TEAM;
  const ctf = DEFAULT_CTFS;

  fieldTile(ctx, "Name", name, infoX + pad2, infoY + 26, tileW, tileH);
  fieldTile(ctx, "Category", category, infoX + pad2, infoY + 26 + tileH + 16, tileW, tileH);

  const gap = 16;
  const halfW = (tileW - gap) / 2;
  fieldTile(ctx, "Team", team, infoX + pad2, infoY + 26 + (tileH + 16) * 2, halfW, tileH);
  fieldTile(ctx, "CTF", ctf, infoX + pad2 + halfW + gap, infoY + 26 + (tileH + 16) * 2, halfW, tileH);

  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
