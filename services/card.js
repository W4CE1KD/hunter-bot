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
  return "D";
}

// Returns a color theme based on rank
function getRankColor(rank) {
  switch (rank) {
    case "S": return { main: "#ff4500", glow: "#ff6a00", badge: "#ff4500" }; // fiery red-orange
    case "A": return { main: "#c084fc", glow: "#9333ea", badge: "#7c3aed" }; // purple
    case "B": return { main: "#38bdf8", glow: "#0ea5e9", badge: "#0369a1" }; // sky blue
    case "C": return { main: "#34d399", glow: "#10b981", badge: "#065f46" }; // green
    default:  return { main: "#94a3b8", glow: "#64748b", badge: "#334155" }; // slate
  }
}

async function generateCard(user) {
  const width  = 1280;
  const height = 720;
  const canvas = createCanvas(width, height);
  const ctx    = canvas.getContext("2d");

  // ── Background template ──────────────────────────────────────────────────
  const template = await loadImage(
    path.join(__dirname, "../assets/license-template.png")
  );
  ctx.drawImage(template, 0, 0, width, height);

  // ── Avatar ───────────────────────────────────────────────────────────────
  try {
    const avatar = await loadImage(user.avatar);
    ctx.save();
    // Rounded clip for avatar
    const ax = 80, ay = 145, aw = 250, ah = 300, r = 18;
    ctx.beginPath();
    ctx.moveTo(ax + r, ay);
    ctx.lineTo(ax + aw - r, ay);
    ctx.quadraticCurveTo(ax + aw, ay, ax + aw, ay + r);
    ctx.lineTo(ax + aw, ay + ah - r);
    ctx.quadraticCurveTo(ax + aw, ay + ah, ax + aw - r, ay + ah);
    ctx.lineTo(ax + r, ay + ah);
    ctx.quadraticCurveTo(ax, ay + ah, ax, ay + ah - r);
    ctx.lineTo(ax, ay + r);
    ctx.quadraticCurveTo(ax, ay, ax + r, ay);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, ax, ay, aw, ah);
    ctx.restore();
  } catch {}

  const licenseNo = String(user.points).padStart(10, "0");
  const rank      = getRank(user.points);
  const colors    = getRankColor(rank);

  // ── Helper: glowing text ─────────────────────────────────────────────────
  function glowText(text, x, y, color, blur = 12) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur  = blur;
    ctx.fillStyle   = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  // ── Helper: gradient text ────────────────────────────────────────────────
  function gradientText(text, x, y, x2, colorA, colorB) {
    const grad = ctx.createLinearGradient(x, 0, x2, 0);
    grad.addColorStop(0, colorA);
    grad.addColorStop(1, colorB);
    ctx.fillStyle = grad;
    ctx.fillText(text, x, y);
  }

  // ════════════════════════════════════════════════════════════════════
  //  ROW 1 — LICENSE NO  +  RANK  (side by side, same baseline)
  // ════════════════════════════════════════════════════════════════════
  const row1LabelY = 170;
  const row1ValueY = 232;

  // — License No. label —
  ctx.font      = "bold 44px RobotoBold";
  ctx.fillStyle = "#1e293b";
  ctx.fillText("License No.", 460, row1LabelY);

  // — License No. box —
  const lboxX = 460, lboxY = 182, lboxW = 310, lboxH = 60;
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth   = 2.5;
  ctx.strokeRect(lboxX, lboxY, lboxW, lboxH);

  // Subtle fill inside the box
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(lboxX + 1, lboxY + 1, lboxW - 2, lboxH - 2);

  ctx.font      = "bold 46px RobotoBold";
  ctx.fillStyle = "#111827";
  ctx.fillText(licenseNo, lboxX + 14, row1ValueY);

  // — Rank label (right of license box) —
  const rankLabelX = lboxX + lboxW + 40;
  ctx.font      = "bold 44px RobotoBold";
  ctx.fillStyle = "#1e293b";
  ctx.fillText("Rank", rankLabelX, row1LabelY);

  // — Rank badge (pill behind text) —
  const rankText  = `[ ${rank} ]`;
  ctx.font        = "bold 54px RobotoBold";
  const rankTW    = ctx.measureText(rankText).width;
  const rankBadgeX = rankLabelX;
  const rankBadgeY = lboxY;
  const rankBadgeW = rankTW + 32;
  const rankBadgeH = lboxH;

  // Pill background
  ctx.save();
  const pr = 14;
  ctx.beginPath();
  ctx.moveTo(rankBadgeX + pr, rankBadgeY);
  ctx.lineTo(rankBadgeX + rankBadgeW - pr, rankBadgeY);
  ctx.quadraticCurveTo(rankBadgeX + rankBadgeW, rankBadgeY, rankBadgeX + rankBadgeW, rankBadgeY + pr);
  ctx.lineTo(rankBadgeX + rankBadgeW, rankBadgeY + rankBadgeH - pr);
  ctx.quadraticCurveTo(rankBadgeX + rankBadgeW, rankBadgeY + rankBadgeH, rankBadgeX + rankBadgeW - pr, rankBadgeY + rankBadgeH);
  ctx.lineTo(rankBadgeX + pr, rankBadgeY + rankBadgeH);
  ctx.quadraticCurveTo(rankBadgeX, rankBadgeY + rankBadgeH, rankBadgeX, rankBadgeY + rankBadgeH - pr);
  ctx.lineTo(rankBadgeX, rankBadgeY + pr);
  ctx.quadraticCurveTo(rankBadgeX, rankBadgeY, rankBadgeX + pr, rankBadgeY);
  ctx.closePath();
  ctx.fillStyle   = colors.badge;
  ctx.shadowColor = colors.glow;
  ctx.shadowBlur  = 20;
  ctx.fill();
  // Border
  ctx.strokeStyle = colors.main;
  ctx.lineWidth   = 2.5;
  ctx.stroke();
  ctx.restore();

  // Rank text (white with glow)
  ctx.font = "bold 54px RobotoBold";
  glowText(rankText, rankBadgeX + 16, row1ValueY, "#ffffff", 16);

  // ════════════════════════════════════════════════════════════════════
  //  ROW 2 — NAME
  // ════════════════════════════════════════════════════════════════════
  ctx.font = "bold 52px RobotoBold";

  // "Name : " in dark
  ctx.fillStyle = "#1e293b";
  ctx.fillText("Name : ", 460, 330);
  const namePrefix = ctx.measureText("Name : ").width;

  // Username in rank color gradient with glow
  const nameStr = `[${user.thmUsername}]`;
  ctx.font = "bold 52px RobotoBold";
  ctx.save();
  ctx.shadowColor = colors.glow;
  ctx.shadowBlur  = 14;
  gradientText(nameStr, 460 + namePrefix, 330, 460 + namePrefix + ctx.measureText(nameStr).width, colors.main, colors.glow);
  ctx.restore();

  // ════════════════════════════════════════════════════════════════════
  //  CATEGORY
  // ════════════════════════════════════════════════════════════════════
  ctx.font      = "bold 48px RobotoBold";
  ctx.fillStyle = "#1e293b";
  ctx.fillText("Category", 460, 400);

  const startX = 460, startY = 420;
  const boxW   = 250,  boxH  = 45,  gap = 25;

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const bx = startX + col * (boxW + gap);
      const by = startY + row * (boxH + 12);

      // Subtle fill
      ctx.fillStyle   = "rgba(255,255,255,0.12)";
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth   = 2;
      ctx.fillRect(bx, by, boxW, boxH);
      ctx.strokeRect(bx, by, boxW, boxH);
    }
  }

  // "Hacker" text in first box — rank-colored with glow
  ctx.font = "bold 38px RobotoBold";
  const txt = "Hacker";
  const tw  = ctx.measureText(txt).width;
  const tx  = startX + (boxW - tw) / 2;
  const ty  = startY + boxH / 2 + 14;
  glowText(txt, tx, ty, colors.main, 10);

  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
