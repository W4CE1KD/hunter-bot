const { createCanvas, loadImage, registerFont } = require("canvas");
const path = require("path");

registerFont(path.join(__dirname, "../fonts/Roboto-Bold.ttf"), {
  family: "RobotoBold",
});
registerFont(path.join(__dirname, "../fonts/Roboto-Regular.ttf"), {
  family: "Roboto",
});

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
      return "#ff2a6d";
    case "A":
      return "#8b5cf6";
    case "B":
      return "#38bdf8";
    case "C":
      return "#22c55e";
    case "D":
      return "#f59e0b";
    default:
      return "#94a3b8";
  }
}

function getCategory(rank) {
  switch (rank) {
    case "S":
      return "Monarch";
    case "A":
      return "Shadow Adept";
    case "B":
      return "Elite Hunter";
    case "C":
      return "Hunter";
    case "D":
      return "Rookie";
    default:
      return "Unawakened";
  }
}

const DEFAULT_TEAM = "morvax60";
const DEFAULT_CTFS = "10";

// 🔥 Put your logo URL here (or set it from env if you want)
const BG_LOGO_URL = process.env.BG_LOGO_URL || ""; // e.g. "https://....png"
const BG_LOGO_OPACITY = 0.10; // ~10%

// ─────────────────────────────────────────
// HELPERS
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

function glowR(ctx, x, y, w, h, r, glowColor, blur = 30, alpha = 0.35) {
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

function drawNoise(ctx, w, h, amount = 5200) {
  ctx.save();
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < amount; i++) {
    const x = (Math.random() * w) | 0;
    const y = (Math.random() * h) | 0;
    const a = Math.random() * 0.9;
    ctx.fillStyle = `rgba(0,0,0,${a})`;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();
}

function drawAura(ctx, w, h, accent) {
  ctx.save();
  ctx.globalAlpha = 0.28;

  const a1 = ctx.createRadialGradient(260, 170, 10, 260, 170, 360);
  a1.addColorStop(0, accent);
  a1.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = a1;
  ctx.fillRect(0, 0, w, h);

  const a2 = ctx.createRadialGradient(w - 180, h - 160, 10, w - 180, h - 160, 420);
  a2.addColorStop(0, accent);
  a2.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = a2;
  ctx.fillRect(0, 0, w, h);

  ctx.restore();
}

async function drawCenteredBgLogo(ctx, canvasW, canvasH, urlOrPath, opacity = 0.1) {
  if (!urlOrPath) return;

  try {
    const img = await loadImage(urlOrPath);

    // Scale logo to ~45% of card width (adjust if you want)
    const targetW = canvasW * 0.45;
    const scale = targetW / img.width;
    const w = img.width * scale;
    const h = img.height * scale;

    const x = (canvasW - w) / 2;
    const y = (canvasH - h) / 2;

    ctx.save();
    ctx.globalAlpha = opacity;

    // very soft glow behind logo
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 30;
    ctx.drawImage(img, x, y, w, h);

    ctx.restore();
  } catch {
    // ignore logo load errors
  }
}

function fieldTile(ctx, label, value, x, y, w, h, accent) {
  glowR(ctx, x, y, w, h, 18, accent, 18, 0.18);
  fillR(ctx, x, y, w, h, 18, "rgba(0,0,0,0.35)");
  strokeR(ctx, x, y, w, h, 18, "rgba(255,255,255,0.10)", 1);

  // left accent bar
  fillR(ctx, x + 12, y + 12, 6, h - 24, 6, accent);

  // label bold
  ctx.font = "bold 14px RobotoBold";
  ctx.fillStyle = "rgba(255,255,255,0.60)";
  ctx.fillText(label.toUpperCase(), x + 28, y + 28);

  // value normal
  const v = value == null ? "" : String(value);
  const maxW = w - 44;
  const size = fitText(ctx, v, maxW, 34, 18, "Roboto", "");
  ctx.font = `${size}px Roboto`;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
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
  const accent = getRankColor(rank);
  const category = getCategory(rank);

  // Background (dark + aura)
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#05060D");
  bg.addColorStop(0.55, "#070A16");
  bg.addColorStop(1, "#04040A");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  drawAura(ctx, width, height, accent);

  // subtle diagonal slashes (kept but lighter)
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  for (let i = -300; i < width + 300; i += 140) {
    ctx.beginPath();
    ctx.moveTo(i, 30);
    ctx.lineTo(i + 60, 30);
    ctx.lineTo(i + 260, height);
    ctx.lineTo(i + 200, height);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // ✅ Center background logo (watermark)
  await drawCenteredBgLogo(ctx, width, height, BG_LOGO_URL, BG_LOGO_OPACITY);

  drawNoise(ctx, width, height, 5200);

  // Outer frame
  glowR(ctx, 22, 22, width - 44, height - 44, 28, accent, 34, 0.28);
  fillR(ctx, 22, 22, width - 44, height - 44, 28, "rgba(255,255,255,0.05)");
  strokeR(ctx, 22, 22, width - 44, height - 44, 28, "rgba(255,255,255,0.10)", 1);

  // Header bar
  const headerX = 46;
  const headerY = 46;
  const headerW = width - 92;
  const headerH = 86;

  fillR(ctx, headerX, headerY, headerW, headerH, 22, "rgba(0,0,0,0.40)");
  strokeR(ctx, headerX, headerY, headerW, headerH, 22, "rgba(255,255,255,0.10)", 1);

  // ✅ Heading ONLY
  ctx.font = "bold 30px RobotoBold";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText("HUNTER CARD", headerX + 22, headerY + 52);

  // License
  const licBoxW = 320;
  const licBoxH = 54;
  const licBoxX = headerX + headerW - (licBoxW + 190);
  const licBoxY = headerY + 16;

  glowR(ctx, licBoxX, licBoxY, licBoxW, licBoxH, 16, accent, 22, 0.22);
  fillR(ctx, licBoxX, licBoxY, licBoxW, licBoxH, 16, "rgba(255,255,255,0.06)");
  strokeR(ctx, licBoxX, licBoxY, licBoxW, licBoxH, 16, "rgba(255,255,255,0.12)", 1);

  fillR(ctx, licBoxX + 12, licBoxY + 12, 6, licBoxH - 24, 6, accent);

  ctx.font = "bold 12px RobotoBold";
  ctx.fillStyle = "rgba(255,255,255,0.60)";
  ctx.fillText("LICENSE", licBoxX + 26, licBoxY + 20);

  ctx.font = "20px Roboto";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText(licenseNo, licBoxX + 26, licBoxY + 44);

  // Rank box
  const rankBoxW = 170;
  const rankBoxH = 54;
  const rankBoxX = headerX + headerW - rankBoxW - 18;
  const rankBoxY = headerY + 16;

  glowR(ctx, rankBoxX, rankBoxY, rankBoxW, rankBoxH, 16, accent, 26, 0.30);
  fillR(ctx, rankBoxX, rankBoxY, rankBoxW, rankBoxH, 16, "rgba(255,255,255,0.06)");
  strokeR(ctx, rankBoxX, rankBoxY, rankBoxW, rankBoxH, 16, "rgba(255,255,255,0.12)", 1);

  ctx.font = "bold 12px RobotoBold";
  ctx.fillStyle = "rgba(255,255,255,0.60)";
  ctx.fillText("RANK", rankBoxX + 20, rankBoxY + 20);

  ctx.font = "bold 26px RobotoBold";
  ctx.fillStyle = accent;
  ctx.fillText(rank, rankBoxX + 112, rankBoxY + 44);

  // Body
  const bodyX = 46;
  const bodyY = 150;
  const bodyW = width - 92;
  const bodyH = height - 200;

  fillR(ctx, bodyX, bodyY, bodyW, bodyH, 26, "rgba(0,0,0,0.32)");
  strokeR(ctx, bodyX, bodyY, bodyW, bodyH, 26, "rgba(255,255,255,0.10)", 1);

  // Avatar panel
  const avPanelX = bodyX + 22;
  const avPanelY = bodyY + 22;
  const avPanelW = 360;
  const avPanelH = bodyH - 44;

  glowR(ctx, avPanelX, avPanelY, avPanelW, avPanelH, 24, accent, 26, 0.22);
  fillR(ctx, avPanelX, avPanelY, avPanelW, avPanelH, 24, "rgba(255,255,255,0.05)");
  strokeR(ctx, avPanelX, avPanelY, avPanelW, avPanelH, 24, "rgba(255,255,255,0.10)", 1);

  const avatarX = avPanelX + 18;
  const avatarY = avPanelY + 18;
  const avatarW = avPanelW - 36;
  const avatarH = avatarW;

  glowR(ctx, avatarX - 6, avatarY - 6, avatarW + 12, avatarH + 12, 22, accent, 30, 0.32);
  strokeR(ctx, avatarX - 2, avatarY - 2, avatarW + 4, avatarH + 4, 20, accent, 3);
  fillR(ctx, avatarX, avatarY, avatarW, avatarH, 18, "rgba(0,0,0,0.35)");

  try {
    const avatar = await loadImage(user.avatar);
    ctx.save();
    roundRect(ctx, avatarX, avatarY, avatarW, avatarH, 18);
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarW, avatarH);
    ctx.restore();
  } catch {}

  // Right info panel
  const infoX = avPanelX + avPanelW + 22;
  const infoY = avPanelY;
  const infoW = bodyX + bodyW - infoX - 22;
  const infoH = avPanelH;

  fillR(ctx, infoX, infoY, infoW, infoH, 24, "rgba(255,255,255,0.04)");
  strokeR(ctx, infoX, infoY, infoW, infoH, 24, "rgba(255,255,255,0.10)", 1);

  const pad = 22;
  const tileW = infoW - pad * 2;
  const tileH = 90;

  const name = user?.thmUsername ?? "Unknown";
  const team = DEFAULT_TEAM;
  const ctf = DEFAULT_CTFS;

  fieldTile(ctx, "Name", name, infoX + pad, infoY + 26, tileW, tileH, accent);
  fieldTile(ctx, "Category", category, infoX + pad, infoY + 26 + tileH + 16, tileW, tileH, accent);

  const gap = 16;
  const halfW = (tileW - gap) / 2;
  fieldTile(ctx, "Team", team, infoX + pad, infoY + 26 + (tileH + 16) * 2, halfW, tileH, accent);
  fieldTile(ctx, "CTF", ctf, infoX + pad + halfW + gap, infoY + 26 + (tileH + 16) * 2, halfW, tileH, accent);

  // Footer removed (extra system lines removed)
  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
