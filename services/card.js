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
  // Muted cool accents for a polished dark UI.
  switch (rank) {
    case "S":
      return "#A4B6CC";
    case "A":
      return "#95A8BE";
    case "B":
      return "#879AAF";
    case "C":
      return "#7A8CA0";
    case "D":
      return "#6E7F91";
    default:
      return "#647383";
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

const DEFAULT_TEAM = "-";
const DEFAULT_CTFS = "-";

function hexToRgba(hex, alpha = 1) {
  const clean = hex.replace("#", "");
  const value = clean.length === 3
    ? clean
      .split("")
      .map((ch) => ch + ch)
      .join("")
    : clean;
  const int = Number.parseInt(value, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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

function fitText(ctx, text, maxWidth, startSize, minSize, fontFamily, weight = "") {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${weight}${weight ? " " : ""}${size}px ${fontFamily}`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 1;
  }
  return minSize;
}

function drawImageCover(ctx, image, x, y, w, h) {
  const scale = Math.max(w / image.width, h / image.height);
  const drawW = image.width * scale;
  const drawH = image.height * scale;
  const drawX = x + (w - drawW) / 2;
  const drawY = y + (h - drawH) / 2;
  ctx.drawImage(image, drawX, drawY, drawW, drawH);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getImageProfile(image) {
  const sampleSize = 24;
  const sampleCanvas = createCanvas(sampleSize, sampleSize);
  const sampleCtx = sampleCanvas.getContext("2d");
  sampleCtx.drawImage(image, 0, 0, sampleSize, sampleSize);

  const { data } = sampleCtx.getImageData(0, 0, sampleSize, sampleSize);
  let totalLuminance = 0;
  let totalSaturation = 0;
  let pixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3] / 255;
    if (alpha <= 0.02) continue;

    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    const luminance = (0.2126 * r) + (0.7152 * g) + (0.0722 * b);

    totalSaturation += saturation;
    totalLuminance += luminance;
    pixels += 1;
  }

  if (pixels === 0) {
    return {
      saturation: 0.35,
      luminance: 0.45,
    };
  }

  return {
    saturation: totalSaturation / pixels,
    luminance: totalLuminance / pixels,
  };
}

function drawAvatarBalanced(ctx, image, x, y, w, h, accent) {
  const profile = getImageProfile(image);
  const saturation = profile.saturation;
  const luminance = profile.luminance;

  // Normalize bright or highly saturated photos so they sit naturally in the dark UI.
  const neutralAlpha = clamp(
    0.05
      + Math.max(0, saturation - 0.38) * 0.26
      + Math.max(0, luminance - 0.66) * 0.20,
    0.05,
    0.21
  );
  const darkOverlayAlpha = clamp(
    0.08
      + Math.max(0, saturation - 0.42) * 0.18
      + Math.max(0, luminance - 0.68) * 0.28,
    0.08,
    0.26
  );
  const liftAlpha = clamp((0.30 - luminance) * 0.22, 0, 0.06);
  const accentBlendAlpha = clamp(0.05 + (saturation * 0.05), 0.05, 0.10);

  ctx.save();
  roundRect(ctx, x, y, w, h, 16);
  ctx.clip();

  drawImageCover(ctx, image, x, y, w, h);

  const edgeVignette = ctx.createRadialGradient(
    x + (w / 2),
    y + (h / 2),
    Math.min(w, h) * 0.22,
    x + (w / 2),
    y + (h / 2),
    Math.max(w, h) * 0.72
  );
  edgeVignette.addColorStop(0, "rgba(0,0,0,0)");
  edgeVignette.addColorStop(1, "rgba(0,0,0,0.50)");
  ctx.fillStyle = edgeVignette;
  ctx.fillRect(x, y, w, h);

  const bottomShade = ctx.createLinearGradient(0, y, 0, y + h);
  bottomShade.addColorStop(0, "rgba(0,0,0,0)");
  bottomShade.addColorStop(0.62, "rgba(0,0,0,0)");
  bottomShade.addColorStop(1, "rgba(0,0,0,0.44)");
  ctx.fillStyle = bottomShade;
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = `rgba(0, 0, 0, ${neutralAlpha})`;
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = `rgba(0, 0, 0, ${darkOverlayAlpha})`;
  ctx.fillRect(x, y, w, h);

  if (liftAlpha > 0) {
    ctx.fillStyle = `rgba(230, 236, 244, ${liftAlpha})`;
    ctx.fillRect(x, y, w, h);
  }

  ctx.fillStyle = hexToRgba(accent, accentBlendAlpha);
  ctx.fillRect(x, y, w, h);

  ctx.restore();
}

function drawDivider(ctx, x, y, w, strokeStyle = "rgba(92,120,150,0.30)") {
  ctx.save();
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  ctx.restore();
}

function drawCornerBrackets(ctx, x, y, w, h, size, color, lineWidth = 2) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(x, y + size);
  ctx.lineTo(x, y);
  ctx.lineTo(x + size, y);

  ctx.moveTo(x + w - size, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + size);

  ctx.moveTo(x + w, y + h - size);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w - size, y + h);

  ctx.moveTo(x + size, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + h - size);
  ctx.stroke();
  ctx.restore();
}

async function generateCard(user) {
  const width = 1280;
  const height = 700;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const points = user?.points ?? 0;
  const rank = getRank(points);
  const accent = getRankColor(rank);
  const category = getCategory(rank);
  const licenseNo = String(points).padStart(10, "0");

  const name = user?.thmUsername ?? "Unknown";
  const team = user?.team ?? DEFAULT_TEAM;
  const ctf = user?.ctf ?? DEFAULT_CTFS;

  const theme = {
    black: "#000000",
    borderStrong: "rgba(128,156,190,0.32)",
    borderSoft: "rgba(128,156,190,0.18)",
    textPrimary: "rgba(240,247,255,0.96)",
    textSecondary: "rgba(170,188,208,0.72)",
    textMuted: "rgba(126,145,168,0.62)",
  };

  ctx.fillStyle = theme.black;
  ctx.fillRect(0, 0, width, height);

  const rightGlow = ctx.createRadialGradient(width * 0.86, height * 0.12, 0, width * 0.86, height * 0.12, 360);
  rightGlow.addColorStop(0, hexToRgba(accent, 0.24));
  rightGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = rightGlow;
  ctx.fillRect(0, 0, width, height);

  const leftGlow = ctx.createRadialGradient(width * 0.12, height * 0.80, 0, width * 0.12, height * 0.80, 320);
  leftGlow.addColorStop(0, hexToRgba(accent, 0.09));
  leftGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = leftGlow;
  ctx.fillRect(0, 0, width, height);

  const beam = ctx.createLinearGradient(0, 0, width, height);
  beam.addColorStop(0, "rgba(0,0,0,0)");
  beam.addColorStop(0.48, "rgba(0,0,0,0)");
  beam.addColorStop(0.60, hexToRgba(accent, 0.045));
  beam.addColorStop(0.76, "rgba(0,0,0,0)");
  beam.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = beam;
  ctx.fillRect(0, 0, width, height);

  const vignette = ctx.createRadialGradient(width / 2, height / 2, width * 0.28, width / 2, height / 2, width * 0.74);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.74)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  const cardX = 24;
  const cardY = 24;
  const cardW = width - 48;
  const cardH = height - 48;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.72)";
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 10;
  fillRoundRect(ctx, cardX, cardY, cardW, cardH, 30, theme.black);
  ctx.restore();

  strokeRoundRect(ctx, cardX, cardY, cardW, cardH, 30, theme.borderStrong, 1.2);
  strokeRoundRect(ctx, cardX + 8, cardY + 8, cardW - 16, cardH - 16, 24, theme.borderSoft, 1);
  const sheen = ctx.createLinearGradient(cardX, cardY, cardX, cardY + 180);
  sheen.addColorStop(0, "rgba(255,255,255,0.06)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  fillRoundRect(ctx, cardX + 1, cardY + 1, cardW - 2, 170, 28, sheen);

  const contentX = cardX + 36;
  const headerY = cardY + 42;
  const headerBottom = cardY + 128;

  ctx.font = "bold 46px RobotoBold";
  ctx.fillStyle = theme.textPrimary;
  ctx.fillText("HUNTER LICENSE", contentX, headerY + 26);

  ctx.font = "24px Roboto";
  ctx.fillStyle = theme.textSecondary;
  ctx.fillText("Secure Identity Card", contentX, headerY + 64);

  ctx.font = "13px Roboto";
  ctx.fillStyle = theme.textMuted;
  ctx.fillText("Access Tier Credential / Zero Trust Network", contentX, headerY + 92);

  const chipW = 90;
  const chipH = 58;
  const chipX = cardX + cardW - 36 - chipW;
  const chipY = cardY + 40;

  fillRoundRect(ctx, chipX, chipY, chipW, chipH, 16, "rgba(8,12,18,0.72)");
  const chipGlow = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY);
  chipGlow.addColorStop(0, hexToRgba(accent, 0.26));
  chipGlow.addColorStop(1, "rgba(0,0,0,0)");
  fillRoundRect(ctx, chipX, chipY, chipW, chipH, 16, chipGlow);
  strokeRoundRect(ctx, chipX, chipY, chipW, chipH, 16, hexToRgba(accent, 0.68), 1.2);
  drawCornerBrackets(ctx, chipX + 4, chipY + 4, chipW - 8, chipH - 8, 8, hexToRgba(accent, 0.48), 1);
  ctx.textAlign = "center";
  ctx.font = "bold 34px RobotoBold";
  ctx.fillStyle = accent;
  ctx.fillText(rank, chipX + chipW / 2, chipY + 41);
  ctx.textAlign = "left";

  const licenseRight = chipX - 30;
  ctx.textAlign = "right";
  ctx.font = "bold 12px RobotoBold";
  ctx.fillStyle = theme.textSecondary;
  ctx.fillText("LICENSE", licenseRight, chipY + 14);
  ctx.font = "30px RobotoBold";
  ctx.fillStyle = theme.textPrimary;
  ctx.fillText(licenseNo, licenseRight, chipY + 50);
  ctx.textAlign = "left";

  const ruleY = headerBottom;
  const rule = ctx.createLinearGradient(cardX + 24, 0, cardX + cardW - 24, 0);
  rule.addColorStop(0, "rgba(128,156,190,0)");
  rule.addColorStop(0.2, "rgba(128,156,190,0.42)");
  rule.addColorStop(0.8, "rgba(128,156,190,0.42)");
  rule.addColorStop(1, "rgba(128,156,190,0)");
  drawDivider(ctx, cardX + 24, ruleY, cardW - 48, rule);

  const accentRule = ctx.createLinearGradient(cardX + 40, 0, cardX + cardW - 40, 0);
  accentRule.addColorStop(0, "rgba(0,0,0,0)");
  accentRule.addColorStop(0.5, hexToRgba(accent, 0.30));
  accentRule.addColorStop(1, "rgba(0,0,0,0)");
  drawDivider(ctx, cardX + 24, ruleY + 1, cardW - 48, accentRule);

  const bodyY = headerBottom + 28;
  const bodyH = cardY + cardH - bodyY - 24;
  const leftX = cardX + 24;
  const leftW = 336;
  const leftH = bodyH;

  fillRoundRect(ctx, leftX, bodyY, leftW, leftH, 24, theme.black);
  strokeRoundRect(ctx, leftX, bodyY, leftW, leftH, 24, theme.borderStrong, 1.2);

  const avatarX = leftX + 18;
  const avatarY = bodyY + 18;
  const avatarW = leftW - 36;
  const avatarH = avatarW;

  fillRoundRect(ctx, avatarX, avatarY, avatarW, avatarH, 18, theme.black);
  strokeRoundRect(ctx, avatarX, avatarY, avatarW, avatarH, 18, "rgba(124,151,184,0.44)", 1.2);

  let avatarDrawn = false;
  if (user?.avatar) {
    try {
      const avatar = await loadImage(user.avatar);
      drawAvatarBalanced(ctx, avatar, avatarX, avatarY, avatarW, avatarH, accent);
      avatarDrawn = true;
    } catch {
      avatarDrawn = false;
    }
  }

  if (!avatarDrawn) {
    const initials = (name.trim()[0] || "U").toUpperCase();
    fillRoundRect(ctx, avatarX, avatarY, avatarW, avatarH, 18, theme.black);
    ctx.textAlign = "center";
    ctx.font = "bold 84px RobotoBold";
    ctx.fillStyle = "rgba(236,240,247,0.62)";
    ctx.fillText(initials, avatarX + avatarW / 2, avatarY + avatarH / 2 + 30);
    ctx.textAlign = "left";
  }

  ctx.font = "bold 12px RobotoBold";
  ctx.fillStyle = theme.textSecondary;
  ctx.fillText("PROFILE", avatarX, avatarY + avatarH + 34);

  const avatarNameSize = fitText(ctx, name, avatarW, 56, 24, "RobotoBold", "bold");
  ctx.font = `bold ${avatarNameSize}px RobotoBold`;
  ctx.fillStyle = theme.textPrimary;
  ctx.fillText(name, avatarX, avatarY + avatarH + 82);

  ctx.font = "13px Roboto";
  ctx.fillStyle = theme.textMuted;
  ctx.fillText("THM USER", avatarX, avatarY + avatarH + 110);

  const infoX = leftX + leftW + 24;
  const infoY = bodyY;
  const infoW = cardX + cardW - infoX - 24;
  const infoH = leftH;

  fillRoundRect(ctx, infoX, infoY, infoW, infoH, 24, theme.black);
  strokeRoundRect(ctx, infoX, infoY, infoW, infoH, 24, theme.borderStrong, 1.2);

  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = accent;
  ctx.font = "bold 270px RobotoBold";
  ctx.fillText(rank, infoX + infoW - 230, infoY + infoH - 18);
  ctx.restore();

  const infoPad = 24;
  const infoTextX = infoX + infoPad;
  const infoTextW = infoW - infoPad * 2;

  const catY = infoY + 24;
  const catH = 124;
  fillRoundRect(ctx, infoTextX, catY, infoTextW, catH, 16, theme.black);
  const catOverlay = ctx.createLinearGradient(infoTextX, 0, infoTextX + infoTextW, 0);
  catOverlay.addColorStop(0, hexToRgba(accent, 0.18));
  catOverlay.addColorStop(0.65, hexToRgba(accent, 0.05));
  catOverlay.addColorStop(1, "rgba(0,0,0,0)");
  fillRoundRect(ctx, infoTextX, catY, infoTextW, catH, 16, catOverlay);
  strokeRoundRect(ctx, infoTextX, catY, infoTextW, catH, 16, "rgba(124,151,184,0.42)", 1.1);
  fillRoundRect(ctx, infoTextX + 12, catY + 14, 6, catH - 28, 4, accent);

  ctx.font = "bold 12px RobotoBold";
  ctx.fillStyle = theme.textSecondary;
  ctx.fillText("CATEGORY", infoTextX + 28, catY + 24);
  const categorySize = fitText(ctx, category, infoTextW - 56, 54, 24, "RobotoBold", "bold");
  ctx.font = `bold ${categorySize}px RobotoBold`;
  ctx.fillStyle = theme.textPrimary;
  ctx.fillText(category, infoTextX + 28, catY + 86);

  const pointsY = catY + catH + 16;
  const pointsH = 150;
  fillRoundRect(ctx, infoTextX, pointsY, infoTextW, pointsH, 16, theme.black);
  strokeRoundRect(ctx, infoTextX, pointsY, infoTextW, pointsH, 16, "rgba(124,151,184,0.34)", 1.1);
  drawDivider(ctx, infoTextX + 12, pointsY + 48, infoTextW - 24, "rgba(124,151,184,0.28)");

  ctx.font = "bold 12px RobotoBold";
  ctx.fillStyle = theme.textSecondary;
  ctx.fillText("POINTS", infoTextX + 18, pointsY + 28);
  const pointsText = points.toLocaleString("en-US");
  const pointsSize = fitText(ctx, pointsText, infoTextW - 36, 80, 34, "RobotoBold", "bold");
  ctx.font = `bold ${pointsSize}px RobotoBold`;
  ctx.fillStyle = theme.textPrimary;
  ctx.fillText(pointsText, infoTextX + 18, pointsY + 117);

  const statY = pointsY + pointsH + 16;
  const statH = Math.max(68, infoY + infoH - statY - 24);
  fillRoundRect(ctx, infoTextX, statY, infoTextW, statH, 14, theme.black);
  strokeRoundRect(ctx, infoTextX, statY, infoTextW, statH, 14, "rgba(124,151,184,0.30)", 1);

  const midX = infoTextX + infoTextW / 2;
  ctx.save();
  ctx.strokeStyle = "rgba(124,151,184,0.26)";
  ctx.beginPath();
  ctx.moveTo(midX, statY + 10);
  ctx.lineTo(midX, statY + statH - 10);
  ctx.stroke();
  ctx.restore();

  ctx.font = "bold 11px RobotoBold";
  ctx.fillStyle = theme.textSecondary;
  ctx.fillText("TEAM", infoTextX + 18, statY + 18);
  ctx.fillText("CTF", midX + 18, statY + 18);

  const teamText = team == null ? "-" : String(team);
  const ctfText = ctf == null ? "-" : String(ctf);

  const teamSize = fitText(ctx, teamText, infoTextW / 2 - 36, 26, 16, "RobotoBold", "bold");
  ctx.font = `bold ${teamSize}px RobotoBold`;
  ctx.fillStyle = theme.textPrimary;
  ctx.fillText(teamText, infoTextX + 18, statY + statH - 20);

  const ctfSize = fitText(ctx, ctfText, infoTextW / 2 - 36, 26, 16, "RobotoBold", "bold");
  ctx.font = `bold ${ctfSize}px RobotoBold`;
  ctx.fillText(ctfText, midX + 18, statY + statH - 20);

  ctx.font = "13px Roboto";
  ctx.fillStyle = theme.textMuted;
  ctx.fillText("Certified | Verified | Generated by rank-bot", cardX + 34, cardY + cardH - 18);

  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
