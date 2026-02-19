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

async function generateCard(user) {
  const width = 1120;
  const height = 620;

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
    line: "rgba(142,170,206,0.24)",
    lineSoft: "rgba(142,170,206,0.14)",
    textPrimary: "rgba(242,248,255,0.96)",
    textSecondary: "rgba(175,194,217,0.72)",
    textMuted: "rgba(126,146,170,0.60)",
  };

  ctx.fillStyle = theme.black;
  ctx.fillRect(0, 0, width, height);

  const rightGlow = ctx.createRadialGradient(width * 0.90, height * 0.16, 0, width * 0.90, height * 0.16, 320);
  rightGlow.addColorStop(0, hexToRgba(accent, 0.16));
  rightGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = rightGlow;
  ctx.fillRect(0, 0, width, height);

  const leftGlow = ctx.createRadialGradient(width * 0.10, height * 0.78, 0, width * 0.10, height * 0.78, 280);
  leftGlow.addColorStop(0, hexToRgba(accent, 0.06));
  leftGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = leftGlow;
  ctx.fillRect(0, 0, width, height);

  const vignette = ctx.createRadialGradient(width / 2, height / 2, width * 0.28, width / 2, height / 2, width * 0.76);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.72)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  const cardX = 20;
  const cardY = 20;
  const cardW = width - 40;
  const cardH = height - 40;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.68)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 8;
  fillRoundRect(ctx, cardX, cardY, cardW, cardH, 28, theme.black);
  ctx.restore();

  strokeRoundRect(ctx, cardX, cardY, cardW, cardH, 28, theme.line, 1.1);
  const topSheen = ctx.createLinearGradient(cardX, cardY, cardX, cardY + 150);
  topSheen.addColorStop(0, "rgba(255,255,255,0.045)");
  topSheen.addColorStop(1, "rgba(255,255,255,0)");
  fillRoundRect(ctx, cardX + 1, cardY + 1, cardW - 2, 146, 26, topSheen);

  const contentX = cardX + 36;
  const headerY = cardY + 34;
  const headerBottom = cardY + 126;

  ctx.font = "bold 58px RobotoBold";
  ctx.fillStyle = theme.textPrimary;
  ctx.fillText("HUNTER LICENSE", contentX, headerY + 24);

  ctx.font = "27px Roboto";
  ctx.fillStyle = theme.textSecondary;
  ctx.fillText("Secure Identity Card", contentX, headerY + 62);

  ctx.font = "13px Roboto";
  ctx.fillStyle = theme.textMuted;
  ctx.fillText("Access Tier Credential / Zero Trust Network", contentX, headerY + 88);

  const chipW = 84;
  const chipH = 54;
  const chipX = cardX + cardW - 36 - chipW;
  const chipY = cardY + 36;

  fillRoundRect(ctx, chipX, chipY, chipW, chipH, 15, "rgba(8,12,18,0.58)");
  strokeRoundRect(ctx, chipX, chipY, chipW, chipH, 15, hexToRgba(accent, 0.52), 1);
  ctx.textAlign = "center";
  ctx.font = "bold 32px RobotoBold";
  ctx.fillStyle = accent;
  ctx.fillText(rank, chipX + chipW / 2, chipY + 39);
  ctx.textAlign = "left";

  const licenseRight = chipX - 22;
  ctx.textAlign = "right";
  ctx.font = "bold 11px RobotoBold";
  ctx.fillStyle = theme.textSecondary;
  ctx.fillText("LICENSE", licenseRight, chipY + 12);
  const licenseSize = fitText(ctx, licenseNo, 270, 44, 26, "RobotoBold", "bold");
  ctx.font = `bold ${licenseSize}px RobotoBold`;
  ctx.fillStyle = theme.textPrimary;
  ctx.fillText(licenseNo, licenseRight, chipY + 48);
  ctx.textAlign = "left";

  const rule = ctx.createLinearGradient(cardX + 24, 0, cardX + cardW - 24, 0);
  rule.addColorStop(0, "rgba(142,170,206,0)");
  rule.addColorStop(0.2, "rgba(142,170,206,0.30)");
  rule.addColorStop(0.8, "rgba(142,170,206,0.30)");
  rule.addColorStop(1, "rgba(142,170,206,0)");
  drawDivider(ctx, cardX + 24, headerBottom, cardW - 48, rule);

  const bodyY = headerBottom + 26;
  const bodyH = cardY + cardH - bodyY - 24;
  const leftX = cardX + 26;
  const leftW = 280;

  const avatarX = leftX;
  const avatarY = bodyY;
  const avatarW = leftW;
  const avatarH = avatarW;

  fillRoundRect(ctx, avatarX, avatarY, avatarW, avatarH, 20, theme.black);
  strokeRoundRect(ctx, avatarX, avatarY, avatarW, avatarH, 20, theme.lineSoft, 1);

  let avatarDrawn = false;
  if (user?.avatar) {
    try {
      const avatar = await loadImage(user.avatar);
      drawAvatarBalanced(ctx, avatar, avatarX + 12, avatarY + 12, avatarW - 24, avatarH - 24, accent);
      avatarDrawn = true;
    } catch {
      avatarDrawn = false;
    }
  }

  if (!avatarDrawn) {
    const initials = (name.trim()[0] || "U").toUpperCase();
    fillRoundRect(ctx, avatarX + 12, avatarY + 12, avatarW - 24, avatarH - 24, 16, theme.black);
    ctx.textAlign = "center";
    ctx.font = "bold 84px RobotoBold";
    ctx.fillStyle = "rgba(236,240,247,0.56)";
    ctx.fillText(initials, avatarX + avatarW / 2, avatarY + avatarH / 2 + 34);
    ctx.textAlign = "left";
  }

  const profileY = avatarY + avatarH + 18;
  ctx.font = "bold 12px RobotoBold";
  ctx.fillStyle = theme.textSecondary;
  ctx.fillText("PROFILE", avatarX + 4, profileY);

  const avatarNameSize = fitText(ctx, name, leftW, 68, 28, "RobotoBold", "bold");
  ctx.font = `bold ${avatarNameSize}px RobotoBold`;
  ctx.fillStyle = theme.textPrimary;
  ctx.fillText(name, avatarX + 4, profileY + 64);

  ctx.font = "13px Roboto";
  ctx.fillStyle = theme.textMuted;
  ctx.fillText("THM USER", avatarX + 4, profileY + 90);

  const infoX = leftX + leftW + 42;
  const infoY = bodyY + 6;
  const infoW = cardX + cardW - infoX - 30;

  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = accent;
  ctx.font = "bold 240px RobotoBold";
  ctx.fillText(rank, infoX + infoW - 200, bodyY + bodyH - 18);
  ctx.restore();

  const sectionLabelX = infoX;
  const sectionW = infoW;

  const catLabelY = infoY + 10;
  ctx.font = "bold 12px RobotoBold";
  ctx.fillStyle = theme.textSecondary;
  ctx.fillText("CATEGORY", sectionLabelX, catLabelY);

  const categorySize = fitText(ctx, category, sectionW, 84, 30, "RobotoBold", "bold");
  ctx.font = `bold ${categorySize}px RobotoBold`;
  ctx.fillStyle = theme.textPrimary;
  ctx.fillText(category, sectionLabelX, catLabelY + 84);

  drawDivider(ctx, sectionLabelX, catLabelY + 108, sectionW, "rgba(142,170,206,0.20)");

  const pointsLabelY = catLabelY + 134;
  ctx.font = "bold 12px RobotoBold";
  ctx.fillStyle = theme.textSecondary;
  ctx.fillText("POINTS", sectionLabelX, pointsLabelY);

  const pointsText = points.toLocaleString("en-US");
  const pointsSize = fitText(ctx, pointsText, sectionW, 108, 44, "RobotoBold", "bold");
  ctx.font = `bold ${pointsSize}px RobotoBold`;
  ctx.fillStyle = theme.textPrimary;
  ctx.fillText(pointsText, sectionLabelX, pointsLabelY + 98);

  drawDivider(ctx, sectionLabelX, pointsLabelY + 122, sectionW, "rgba(142,170,206,0.20)");

  const statsY = pointsLabelY + 152;
  const midX = sectionLabelX + sectionW / 2;

  ctx.save();
  ctx.strokeStyle = "rgba(142,170,206,0.20)";
  ctx.beginPath();
  ctx.moveTo(midX, statsY + 10);
  ctx.lineTo(midX, statsY + 88);
  ctx.stroke();
  ctx.restore();

  ctx.font = "bold 12px RobotoBold";
  ctx.fillStyle = theme.textSecondary;
  ctx.fillText("TEAM", sectionLabelX, statsY + 14);
  ctx.fillText("CTF", midX + 18, statsY + 14);

  const teamText = team == null ? "-" : String(team);
  const ctfText = ctf == null ? "-" : String(ctf);

  const teamSize = fitText(ctx, teamText, sectionW / 2 - 20, 44, 18, "RobotoBold", "bold");
  ctx.font = `bold ${teamSize}px RobotoBold`;
  ctx.fillStyle = theme.textPrimary;
  ctx.fillText(teamText, sectionLabelX, statsY + 84);

  const ctfSize = fitText(ctx, ctfText, sectionW / 2 - 20, 44, 18, "RobotoBold", "bold");
  ctx.font = `bold ${ctfSize}px RobotoBold`;
  ctx.fillText(ctfText, midX + 18, statsY + 84);

  ctx.font = "13px Roboto";
  ctx.fillStyle = theme.textMuted;
  ctx.fillText("Certified | Verified | Generated by rank-bot", cardX + 34, cardY + cardH - 18);

  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
