// card.js (ANIME STYLE ID CARD)
// - No template image required
// - Bright anime/guild-card vibe (diagonal shapes + stamp + sparkles)
// - Avatar frame + rank badge + license + clean fields
// - Labels bold, values normal
// - Auto-fit long names
//
// Needs fonts:
//   /fonts/Roboto-Bold.ttf
//   /fonts/Roboto-Regular.ttf

const { createCanvas, loadImage, registerFont } = require("canvas");
const path = require("path");

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
      return "#7c3aed"; // purple
    case "B":
      return "#2563eb"; // blue
    case "C":
      return "#16a34a"; // green
    case "D":
      return "#f59e0b"; // amber
    default:
      return "#475569"; // slate
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

function glowR(ctx, x, y, w, h, r, glowColor, blur = 26, alpha = 0.35) {
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
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${weight}${weight ? " " : ""}${size}px ${fontFamily}`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 1;
  }
  return minSize;
}

function drawSparkles(ctx, x, y, w, h, n = 18) {
  ctx.save();
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < n; i++) {
    const sx = x + Math.random() * w;
    const sy = y + Math.random() * h;
    const r = 1 + Math.random() * 2.5;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fill();
  }
  ctx.restore();
}

function drawStamp(ctx, x, y, size, accent) {
  // “CERTIFIED” circle stamp
  const cx = x + size / 2;
  const cy = y + size / 2;

  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 6;
  ctx.strokeStyle = accent;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.46, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.36, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 0.35;
  ctx.font = "bold 16px RobotoBold";
  ctx.fillStyle = accent;
  ctx.fillText("CERTIFIED", cx - 46, cy + 6);

  // little star
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 38);
  ctx.lineTo(cx + 6, cy - 24);
  ctx.lineTo(cx + 22, cy - 24);
  ctx.lineTo(cx + 10, cy - 14);
  ctx.lineTo(cx + 14, cy + 2);
  ctx.lineTo(cx, cy - 8);
  ctx.lineTo(cx - 14, cy + 2);
  ctx.lineTo(cx - 10, cy - 14);
  ctx.lineTo(cx - 22, cy - 24);
  ctx.lineTo(cx - 6, cy - 24);
  ctx.closePath();
  ctx.fillStyle = accent;
  ctx.fill();

  ctx.restore();
}

// ─────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────
async function generateCard(user) {
  // Anime card proportions (nice in Discord)
  const width = 1180;
  const height = 620;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const points = user?.points ?? 0;
  const licenseNo = String(points).padStart(10, "0");
  const rank = getRank(points);
  const accent = getRankColor(rank);
  const category = getCategory(rank);

  // ─────────────────────────────────────────
  // BACKGROUND (anime bright + soft)
  // ─────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#f8fafc");  // very light
  bg.addColorStop(0.55, "#eef2ff"); // soft lavender
  bg.addColorStop(1, "#ecfeff");  // soft cyan
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // big diagonal accent shapes
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(-60, 120);
  ctx.lineTo(520, -40);
  ctx.lineTo(640, 40);
  ctx.lineTo(60, 200);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.10;
  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.moveTo(width - 80, height + 40);
  ctx.lineTo(width + 60, height - 220);
  ctx.lineTo(width - 200, height - 340);
  ctx.lineTo(width - 340, height - 90);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // sparkles (top-right)
  drawSparkles(ctx, width - 420, 40, 360, 180, 22);

  // outer frame
  glowR(ctx, 22, 22, width - 44, height - 44, 30, accent, 24, 0.20);
  fillR(ctx, 22, 22, width - 44, height - 44, 30, "rgba(255,255,255,0.70)");
  strokeR(ctx, 22, 22, width - 44, height - 44, 30, "rgba(17,24,39,0.14)", 2);

  // header strip
  fillR(ctx, 44, 44, width - 88, 82, 22, "rgba(17,24,39,0.06)");
  strokeR(ctx, 44, 44, width - 88, 82, 22, "rgba(17,24,39,0.10)", 1);

  // Title (anime/guild vibe)
  ctx.font = "bold 30px RobotoBold";
  ctx.fillStyle = "#0f172a";
  ctx.fillText("HUNTER ACCESS CARD", 70, 92);

  ctx.font = "16px Roboto";
  ctx.fillStyle = "rgba(15,23,42,0.70)";
  ctx.fillText("Hunter Association • Verified Identity", 72, 114);

  // ─────────────────────────────────────────
  // Rank badge (right)
  // ─────────────────────────────────────────
  const rankBoxW = 180;
  const rankBoxH = 66;
  const rankBoxX = width - 70 - rankBoxW;
  const rankBoxY = 56;

  glowR(ctx, rankBoxX, rankBoxY, rankBoxW, rankBoxH, 18, accent, 20, 0.25);
  fillR(ctx, rankBoxX, rankBoxY, rankBoxW, rankBoxH, 18, "rgba(255,255,255,0.85)");
  strokeR(ctx, rankBoxX, rankBoxY, rankBoxW, rankBoxH, 18, "rgba(15,23,42,0.14)", 1);

  // little top accent
  ctx.save();
  ctx.globalAlpha = 0.9;
  fillR(ctx, rankBoxX + 10, rankBoxY + 10, 8, rankBoxH - 20, 8, accent);
  ctx.restore();

  ctx.font = "bold 14px RobotoBold";
  ctx.fillStyle = "rgba(15,23,42,0.65)";
  ctx.fillText("RANK", rankBoxX + 28, rankBoxY + 24);

  ctx.font = "bold 34px RobotoBold";
  ctx.fillStyle = accent;
  ctx.fillText(rank, rankBoxX + 28, rankBoxY + 56);

  // faint huge rank watermark
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.font = "240px RobotoBold";
  ctx.fillStyle = accent;
  ctx.fillText(rank, width - 260, 260);
  ctx.restore();

  // ─────────────────────────────────────────
  // License pill (left of rank)
  // ─────────────────────────────────────────
  const licW = 320;
  const licH = 54;
  const licX = rankBoxX - 18 - licW;
  const licY = 62;

  fillR(ctx, licX, licY, licW, licH, 18, "rgba(255,255,255,0.85)");
  strokeR(ctx, licX, licY, licW, licH, 18, "rgba(15,23,42,0.14)", 1);

  ctx.save();
  ctx.globalAlpha = 0.9;
  fillR(ctx, licX + 10, licY + 10, 8, licH - 20, 8, accent);
  ctx.restore();

  ctx.font = "bold 13px RobotoBold";
  ctx.fillStyle = "rgba(15,23,42,0.65)";
  ctx.fillText("LICENSE", licX + 28, licY + 22);

  ctx.font = "22px Roboto";
  ctx.fillStyle = "#0f172a";
  ctx.fillText(licenseNo, licX + 28, licY + 44);

  // ─────────────────────────────────────────
  // BODY LAYOUT
  // ─────────────────────────────────────────
  const bodyX = 54;
  const bodyY = 150;
  const bodyW = width - 108;
  const bodyH = height - 210;

  // Main body panel
  fillR(ctx, bodyX, bodyY, bodyW, bodyH, 26, "rgba(255,255,255,0.70)");
  strokeR(ctx, bodyX, bodyY, bodyW, bodyH, 26, "rgba(15,23,42,0.12)", 1);

  // Left avatar panel
  const avatarPanelX = bodyX + 22;
  const avatarPanelY = bodyY + 22;
  const avatarPanelW = 330;
  const avatarPanelH = bodyH - 44;

  glowR(ctx, avatarPanelX, avatarPanelY, avatarPanelW, avatarPanelH, 24, accent, 18, 0.20);
  fillR(ctx, avatarPanelX, avatarPanelY, avatarPanelW, avatarPanelH, 24, "rgba(15,23,42,0.06)");
  strokeR(ctx, avatarPanelX, avatarPanelY, avatarPanelW, avatarPanelH, 24, "rgba(15,23,42,0.12)", 1);

  // Avatar frame
  const avX = avatarPanelX + 18;
  const avY = avatarPanelY + 18;
  const avW = avatarPanelW - 36;
  const avH = avatarPanelW - 36; // square

  strokeR(ctx, avX - 3, avY - 3, avW + 6, avH + 6, 18, accent, 4);

  try {
    const avatar = await loadImage(user.avatar);
    ctx.save();
    roundRect(ctx, avX, avY, avW, avH, 16);
    ctx.clip();
    ctx.drawImage(avatar, avX, avY, avW, avH);
    ctx.restore();
  } catch {
    ctx.font = "16px Roboto";
    ctx.fillStyle = "rgba(15,23,42,0.55)";
    ctx.fillText("No avatar", avX + 14, avY + 28);
  }

  // Stamp + small ID note
  drawStamp(ctx, avatarPanelX + 52, avY + avH + 26, 130, accent);

  ctx.font = "bold 14px RobotoBold";
  ctx.fillStyle = "rgba(15,23,42,0.70)";
  ctx.fillText("VALIDATION", avatarPanelX + 22, avatarPanelY + avatarPanelH - 52);

  ctx.font = "14px Roboto";
  ctx.fillStyle = "rgba(15,23,42,0.55)";
  ctx.fillText("Issued by Hunter Association", avatarPanelX + 22, avatarPanelY + avatarPanelH - 30);

  // Right info area
  const infoX = avatarPanelX + avatarPanelW + 22;
  const infoY = avatarPanelY;
  const infoW = bodyX + bodyW - infoX - 22;
  const infoH = avatarPanelH;

  // Info panel
  fillR(ctx, infoX, infoY, infoW, infoH, 24, "rgba(15,23,42,0.04)");
  strokeR(ctx, infoX, infoY, infoW, infoH, 24, "rgba(15,23,42,0.10)", 1);

  // Field tiles (anime clean)
  function fieldTile(label, value, x, y, w, h) {
    fillR(ctx, x, y, w, h, 18, "rgba(255,255,255,0.86)");
    strokeR(ctx, x, y, w, h, 18, "rgba(15,23,42,0.12)", 1);

    // accent top strip
    ctx.save();
    ctx.globalAlpha = 0.95;
    fillR(ctx, x + 12, y + 12, w - 24, 6, 6, accent);
    ctx.restore();

    // label (bold)
    ctx.font = "bold 15px RobotoBold";
    ctx.fillStyle = "rgba(15,23,42,0.65)";
    ctx.fillText(label.toUpperCase(), x + 18, y + 38);

    // value (normal, auto-fit)
    const v = value == null ? "" : String(value);
    const maxW = w - 36;
    const size = fitText(ctx, v, maxW, 42, 22, "Roboto");
    ctx.font = `${size}px Roboto`;
    ctx.fillStyle = "#0f172a";
    ctx.fillText(v, x + 18, y + 78);
  }

  const name = user?.thmUsername ?? "Unknown";
  const team = DEFAULT_TEAM;
  const ctf = DEFAULT_CTFS;

  const tileW = infoW - 44;
  const tileX = infoX + 22;
  let curY = infoY + 22;

  fieldTile("Name", name, tileX, curY, tileW, 104);
  curY += 104 + 16;

  fieldTile("Category", category, tileX, curY, tileW, 104);
  curY += 104 + 16;

  // Split tiles row
  const gap = 16;
  const halfW = (tileW - gap) / 2;

  fieldTile("Team", team, tileX, curY, halfW, 104);
  fieldTile("CTF", ctf, tileX + halfW + gap, curY, halfW, 104);

  // Footer
  ctx.font = "14px Roboto";
  ctx.fillStyle = "rgba(15,23,42,0.60)";
  ctx.fillText(
    "This card certifies the holder as a verified hunter • Generated by rank-bot",
    64,
    height - 44
  );

  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
