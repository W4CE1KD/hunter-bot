// card.js (Solo Leveling Theme + OP AVATAR)
// ✅ OP Avatar: bigger panel + zoomed cover + neon glow + inner highlight + shard sparks
// ✅ Heading only: HUNTER CARD
// ✅ Compact License + Rank (not long pill)
// ✅ Optional centered watermark logo (opacity 0.10) via BG_LOGO_URL
// ✅ Optional Solo bg image local: assets/solo-bg.jpg (recommended)
// ✅ Labels bold, values normal, name auto-fit

const { createCanvas, loadImage, registerFont } = require("canvas");
const path = require("path");

// ─────────────────────────────────────────
// FONTS
// ─────────────────────────────────────────
registerFont(path.join(__dirname, "../fonts/Roboto-Bold.ttf"), { family: "RobotoBold" });
registerFont(path.join(__dirname, "../fonts/Roboto-Regular.ttf"), { family: "Roboto" });

// ─────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────
// Download your wallpaper and save it here:
const BG_IMAGE_PATH = path.join(__dirname, "../assets/solo-bg.jpg");

// Optional centered watermark logo (direct .png/.jpg URL or local path)
const WATERMARK_LOGO = process.env.BG_LOGO_URL || "";
const WATERMARK_OPACITY = 0.10;

// UI colors (solo vibe)
const TEXT_MAIN = "rgba(255,255,255,0.92)";
const TEXT_DIM = "rgba(255,255,255,0.60)";
const UI_ACCENT = "#8b5cf6";   // purple
const UI_ACCENT_2 = "#38bdf8"; // blue

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

function getRankAccent(rank) {
  // Solo vibe: A/B blue-purple, S red/pink
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

function glowR(ctx, x, y, w, h, r, glowColor, blur = 28, alpha = 0.30) {
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

// CSS object-fit: cover
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
    const targetW = canvasW * 0.42;
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

function drawAuraOverlay(ctx, w, h, accent) {
  ctx.save();
  ctx.globalAlpha = 0.22;
  const a = ctx.createRadialGradient(320, 230, 20, 320, 230, 460);
  a.addColorStop(0, accent);
  a.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = a;
  ctx.fillRect(0, 0, w, h);

  ctx.globalAlpha = 0.16;
  const b = ctx.createRadialGradient(w - 220, h - 180, 20, w - 220, h - 180, 520);
  b.addColorStop(0, UI_ACCENT_2);
  b.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = b;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function fieldTile(ctx, label, value, x, y, w, h, accent) {
  glowR(ctx, x, y, w, h, 18, accent, 18, 0.22);
  fillR(ctx, x, y, w, h, 18, "rgba(0,0,0,0.42)");
  strokeR(ctx, x, y, w, h, 18, "rgba(255,255,255,0.12)", 1);

  // left accent bar
  fillR(ctx, x + 12, y + 12, 6, h - 24, 6, accent);

  // label bold
  ctx.font = "bold 14px RobotoBold";
  ctx.fillStyle = TEXT_DIM;
  ctx.fillText(label.toUpperCase(), x + 28, y + 28);

  // value normal (auto-fit)
  const v = value == null ? "" : String(value);
  const size = fitText(ctx, v, w - 46, 34, 18, "Roboto", "");
  ctx.font = `${size}px Roboto`;
  ctx.fillStyle = TEXT_MAIN;
  ctx.fillText(v, x + 28, y + 64);
}

function drawOPAvatarEffects(ctx, x, y, w, h, accent) {
  // Outer glow box
  glowR(ctx, x - 10, y - 10, w + 20, h + 20, 26, accent, 42, 0.40);

  // Double border (neon)
  strokeR(ctx, x - 3, y - 3, w + 6, h + 6, 22, accent, 3);
  strokeR(ctx, x - 7, y - 7, w + 14, h + 14, 26, "rgba(56,189,248,0.75)", 2);

  // Inner highlight gradient (top-left shine)
  ctx.save();
  ctx.globalAlpha = 0.18;
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, "rgba(255,255,255,0.85)");
  g.addColorStop(0.35, "rgba(255,255,255,0.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  roundRect(ctx, x, y, w, h, 18);
  ctx.clip();
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.restore();

  // Small “shard sparks” around frame
  ctx.save();
  ctx.globalAlpha = 0.22;
  for (let i = 0; i < 16; i++) {
    const px = x - 18 + Math.random() * (w + 36);
    const py = y - 18 + Math.random() * (h + 36);
    const len = 6 + Math.random() * 14;
    const ang = Math.random() * Math.PI * 2;
    ctx.strokeStyle = Math.random() > 0.5 ? accent : UI_ACCENT_2;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + Math.cos(ang) * len, py + Math.sin(ang) * len);
    ctx.stroke();
  }
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
  const rankAccent = getRankAccent(rank);
  const category = getCategory(rank);

  // ───────────────── Background
  let bgImg = null;
  try {
    bgImg = await loadImage(BG_IMAGE_PATH);
  } catch {
    bgImg = null;
  }

  if (bgImg) {
    drawImageCover(ctx, bgImg, 0, 0, width, height);
  } else {
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, "#05060D");
    g.addColorStop(1, "#0b0f25");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }

  // Dark overlay for readability
  ctx.save();
  const overlay = ctx.createLinearGradient(0, 0, width, height);
  overlay.addColorStop(0, "rgba(0,0,0,0.72)");
  overlay.addColorStop(0.55, "rgba(0,0,0,0.55)");
  overlay.addColorStop(1, "rgba(0,0,0,0.74)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  drawAuraOverlay(ctx, width, height, rankAccent);

  // Optional centered watermark (logo)
  await drawWatermark(ctx, width, height, WATERMARK_LOGO, WATERMARK_OPACITY);

  // ───────────────── Frame
  glowR(ctx, 22, 22, width - 44, height - 44, 28, rankAccent, 36, 0.32);
  fillR(ctx, 22, 22, width - 44, height - 44, 28, "rgba(255,255,255,0.04)");
  strokeR(ctx, 22, 22, width - 44, height - 44, 28, "rgba(255,255,255,0.10)", 1);

  // ───────────────── Header
  const headerX = 46;
  const headerY = 46;
  const headerW = width - 92;
  const headerH = 86;

  fillR(ctx, headerX, headerY, headerW, headerH, 22, "rgba(0,0,0,0.48)");
  strokeR(ctx, headerX, headerY, headerW, headerH, 22, "rgba(255,255,255,0.12)", 1);

  // Heading only
  ctx.font = "bold 32px RobotoBold";
  ctx.fillStyle = TEXT_MAIN;
  ctx.fillText("HUNTER CARD", headerX + 22, headerY + 55);

  // ───────────────── Top-right compact badges (NO long strip)
  const badgePad = 14;
  const badgeH = 54;
  const badgeRight = headerX + headerW - 18;
  const badgeTop = headerY + 16;

  // RANK badge
  const rankW = 110;
  const rX = badgeRight - rankW;
  const rY = badgeTop;

  glowR(ctx, rX, rY, rankW, badgeH, 16, rankAccent, 28, 0.36);
  fillR(ctx, rX, rY, rankW, badgeH, 16, "rgba(0,0,0,0.58)");
  strokeR(ctx, rX, rY, rankW, badgeH, 16, "rgba(255,255,255,0.14)", 1);

  fillR(ctx, rX + 12, rY + 10, rankW - 24, 4, 4, "rgba(255,255,255,0.10)");

  ctx.font = "bold 11px RobotoBold";
  ctx.fillStyle = TEXT_DIM;
  ctx.fillText("RANK", rX + 14, rY + 22);

  ctx.font = "bold 30px RobotoBold";
  ctx.fillStyle = rankAccent;
  ctx.fillText(rank, rX + 64, rY + 44);

  // LICENSE badge (compact)
  const licW = 170;
  const lX = rX - badgePad - licW;
  const lY = badgeTop;

  glowR(ctx, lX, lY, licW, badgeH, 16, UI_ACCENT_2, 22, 0.22);
  fillR(ctx, lX, lY, licW, badgeH, 16, "rgba(0,0,0,0.58)");
  strokeR(ctx, lX, lY, licW, badgeH, 16, "rgba(255,255,255,0.14)", 1);

  fillR(ctx, lX + 12, lY + 12, 6, badgeH - 24, 6, UI_ACCENT_2);

  ctx.font = "bold 11px RobotoBold";
  ctx.fillStyle = TEXT_DIM;
  ctx.fillText("LICENSE", lX + 26, lY + 22);

  // smaller number to fit compact badge
  ctx.font = "16px Roboto";
  ctx.fillStyle = TEXT_MAIN;
  ctx.fillText(licenseNo, lX + 26, lY + 44);

  // ───────────────── Body
  const bodyX = 46, bodyY = 150, bodyW = width - 92, bodyH = height - 200;
  fillR(ctx, bodyX, bodyY, bodyW, bodyH, 26, "rgba(0,0,0,0.42)");
  strokeR(ctx, bodyX, bodyY, bodyW, bodyH, 26, "rgba(255,255,255,0.12)", 1);

  // ───────────────── Avatar panel (OP)
  const avPanelX = bodyX + 22;
  const avPanelY = bodyY + 22;

  // bigger avatar panel (OP)
  const avPanelW = 430; // was 360
  const avPanelH = bodyH - 44;

  glowR(ctx, avPanelX, avPanelY, avPanelW, avPanelH, 24, rankAccent, 30, 0.28);
  fillR(ctx, avPanelX, avPanelY, avPanelW, avPanelH, 24, "rgba(255,255,255,0.05)");
  strokeR(ctx, avPanelX, avPanelY, avPanelW, avPanelH, 24, "rgba(255,255,255,0.12)", 1);

  const avatarPadding = 16;
  const avatarX = avPanelX + avatarPadding;
  const avatarY = avPanelY + avatarPadding;
  const avatarW = avPanelW - avatarPadding * 2;
  const avatarH = avatarW; // square

  // OP effects first (frame glow/shards)
  drawOPAvatarEffects(ctx, avatarX, avatarY, avatarW, avatarH, rankAccent);

  // avatar image (cover + slight zoom for “OP”)
  try {
    const avatar = await loadImage(user.avatar);
    ctx.save();
    roundRect(ctx, avatarX, avatarY, avatarW, avatarH, 18);
    ctx.clip();

    // slight zoom-in (1.08x) for better face focus
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

  // subtle dark fade at bottom of avatar for readability
  ctx.save();
  ctx.globalAlpha = 0.35;
  const fade = ctx.createLinearGradient(avatarX, avatarY + avatarH * 0.55, avatarX, avatarY + avatarH);
  fade.addColorStop(0, "rgba(0,0,0,0)");
  fade.addColorStop(1, "rgba(0,0,0,1)");
  roundRect(ctx, avatarX, avatarY, avatarW, avatarH, 18);
  ctx.clip();
  ctx.fillStyle = fade;
  ctx.fillRect(avatarX, avatarY, avatarW, avatarH);
  ctx.restore();

  // ───────────────── Info panel
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
  const category = getCategory(getRank(points));

  fieldTile(ctx, "Name", name, infoX + pad, infoY + 26, tileW, tileH, UI_ACCENT_2);
  fieldTile(ctx, "Category", category, infoX + pad, infoY + 26 + tileH + 16, tileW, tileH, UI_ACCENT);

  const gap = 16;
  const halfW = (tileW - gap) / 2;
  fieldTile(ctx, "Team", team, infoX + pad, infoY + 26 + (tileH + 16) * 2, halfW, tileH, UI_ACCENT_2);
  fieldTile(ctx, "CTF", ctf, infoX + pad + halfW + gap, infoY + 26 + (tileH + 16) * 2, halfW, tileH, UI_ACCENT);

  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
