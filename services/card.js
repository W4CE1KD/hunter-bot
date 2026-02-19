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
  edgeVignette.addColorStop(1, "rgba(7,10,14,0.34)");
  ctx.fillStyle = edgeVignette;
  ctx.fillRect(x, y, w, h);

  const bottomShade = ctx.createLinearGradient(0, y, 0, y + h);
  bottomShade.addColorStop(0, "rgba(0,0,0,0)");
  bottomShade.addColorStop(0.62, "rgba(0,0,0,0)");
  bottomShade.addColorStop(1, "rgba(7,10,14,0.30)");
  ctx.fillStyle = bottomShade;
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = `rgba(118, 127, 141, ${neutralAlpha})`;
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = `rgba(8, 12, 18, ${darkOverlayAlpha})`;
  ctx.fillRect(x, y, w, h);

  if (liftAlpha > 0) {
    ctx.fillStyle = `rgba(230, 236, 244, ${liftAlpha})`;
    ctx.fillRect(x, y, w, h);
  }

  ctx.fillStyle = hexToRgba(accent, accentBlendAlpha);
  ctx.fillRect(x, y, w, h);

  ctx.restore();
}

function drawDivider(ctx, x, y, w, strokeStyle = "rgba(255,255,255,0.08)") {
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
  const width = 1200;
  const height = 520;

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

  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#0B0F14");
  bg.addColorStop(0.55, "#10161E");
  bg.addColorStop(1, "#0B0F14");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const accentGlow = ctx.createRadialGradient(width * 0.82, height * 0.16, 0, width * 0.82, height * 0.16, 300);
  accentGlow.addColorStop(0, hexToRgba(accent, 0.2));
  accentGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = accentGlow;
  ctx.fillRect(0, 0, width, height);

  const vignette = ctx.createRadialGradient(width / 2, height / 2, width * 0.32, width / 2, height / 2, width * 0.75);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.46)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  const cardX = 24;
  const cardY = 24;
  const cardW = width - 48;
  const cardH = height - 48;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 8;
  fillRoundRect(ctx, cardX, cardY, cardW, cardH, 26, "#131A22");
  ctx.restore();

  const cardSurface = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
  cardSurface.addColorStop(0, "rgba(255,255,255,0.030)");
  cardSurface.addColorStop(1, "rgba(255,255,255,0.010)");
  fillRoundRect(ctx, cardX, cardY, cardW, cardH, 26, cardSurface);
  strokeRoundRect(ctx, cardX, cardY, cardW, cardH, 26, "rgba(255,255,255,0.10)", 1);

  const contentX = cardX + 36;
  const headerY = cardY + 38;

  ctx.font = "bold 32px RobotoBold";
  ctx.fillStyle = "rgba(236,240,247,0.96)";
  ctx.fillText("HUNTER LICENSE", contentX, headerY + 26);

  ctx.font = "15px Roboto";
  ctx.fillStyle = "rgba(236,240,247,0.56)";
  ctx.fillText("Secure Identity Card", contentX, headerY + 52);

  const chipW = 74;
  const chipH = 46;
  const chipX = cardX + cardW - 36 - chipW;
  const chipY = cardY + 40;

  fillRoundRect(ctx, chipX, chipY, chipW, chipH, 14, hexToRgba(accent, 0.16));
  strokeRoundRect(ctx, chipX, chipY, chipW, chipH, 14, hexToRgba(accent, 0.62), 1);
  ctx.textAlign = "center";
  ctx.font = "bold 28px RobotoBold";
  ctx.fillStyle = accent;
  ctx.fillText(rank, chipX + chipW / 2, chipY + 33);
  ctx.textAlign = "left";

  const licenseRight = chipX - 24;
  ctx.textAlign = "right";
  ctx.font = "bold 11px RobotoBold";
  ctx.fillStyle = "rgba(236,240,247,0.50)";
  ctx.fillText("LICENSE", licenseRight, chipY + 12);
  ctx.font = "20px Roboto";
  ctx.fillStyle = "rgba(236,240,247,0.90)";
  ctx.fillText(licenseNo, licenseRight, chipY + 37);
  ctx.textAlign = "left";

  const ruleY = cardY + 114;
  const rule = ctx.createLinearGradient(cardX + 24, 0, cardX + cardW - 24, 0);
  rule.addColorStop(0, "rgba(255,255,255,0)");
  rule.addColorStop(0.2, "rgba(255,255,255,0.10)");
  rule.addColorStop(0.8, "rgba(255,255,255,0.10)");
  rule.addColorStop(1, "rgba(255,255,255,0)");
  drawDivider(ctx, cardX + 24, ruleY, cardW - 48, rule);

  const accentRule = ctx.createLinearGradient(cardX + 24, 0, cardX + cardW - 24, 0);
  accentRule.addColorStop(0, "rgba(0,0,0,0)");
  accentRule.addColorStop(0.55, hexToRgba(accent, 0.35));
  accentRule.addColorStop(1, "rgba(0,0,0,0)");
  drawDivider(ctx, cardX + 24, ruleY + 1, cardW - 48, accentRule);

  const bodyY = cardY + 132;
  const leftX = cardX + 34;
  const leftW = 286;
  const leftH = 304;

  fillRoundRect(ctx, leftX, bodyY, leftW, leftH, 20, "rgba(10,14,20,0.78)");
  strokeRoundRect(ctx, leftX, bodyY, leftW, leftH, 20, "rgba(255,255,255,0.10)", 1);

  const avatarX = leftX + 18;
  const avatarY = bodyY + 18;
  const avatarW = leftW - 36;
  const avatarH = 214;

  fillRoundRect(ctx, avatarX, avatarY, avatarW, avatarH, 16, "rgba(255,255,255,0.04)");
  strokeRoundRect(ctx, avatarX, avatarY, avatarW, avatarH, 16, "rgba(255,255,255,0.08)", 1);

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
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(avatarX, avatarY, avatarW, avatarH);
    ctx.textAlign = "center";
    ctx.font = "bold 84px RobotoBold";
    ctx.fillStyle = "rgba(236,240,247,0.50)";
    ctx.fillText(initials, avatarX + avatarW / 2, avatarY + avatarH / 2 + 30);
    ctx.textAlign = "left";
  }

  ctx.font = "bold 11px RobotoBold";
  ctx.fillStyle = "rgba(236,240,247,0.46)";
  ctx.fillText("PROFILE", avatarX, bodyY + leftH - 48);

  const avatarNameSize = fitText(ctx, name, avatarW, 34, 20, "RobotoBold", "bold");
  ctx.font = `bold ${avatarNameSize}px RobotoBold`;
  ctx.fillStyle = "rgba(236,240,247,0.94)";
  ctx.fillText(name, avatarX, bodyY + leftH - 14);

  const infoX = leftX + leftW + 26;
  const infoY = bodyY;
  const infoW = cardX + cardW - infoX - 34;
  const infoH = leftH;

  fillRoundRect(ctx, infoX, infoY, infoW, infoH, 20, "rgba(255,255,255,0.028)");
  strokeRoundRect(ctx, infoX, infoY, infoW, infoH, 20, "rgba(255,255,255,0.10)", 1);

  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = accent;
  ctx.font = "bold 180px RobotoBold";
  ctx.fillText(rank, infoX + infoW - 155, infoY + infoH - 28);
  ctx.restore();

  const infoPad = 30;
  const infoTextX = infoX + infoPad;
  const infoTextW = infoW - infoPad * 2;

  function drawField(label, value, y, startSize = 42, minSize = 22) {
    ctx.font = "bold 12px RobotoBold";
    ctx.fillStyle = "rgba(236,240,247,0.50)";
    ctx.fillText(label.toUpperCase(), infoTextX, y);

    const text = value == null ? "-" : String(value);
    const size = fitText(ctx, text, infoTextW, startSize, minSize, "RobotoBold", "bold");
    ctx.font = `bold ${size}px RobotoBold`;
    ctx.fillStyle = "rgba(236,240,247,0.95)";
    ctx.fillText(text, infoTextX, y + 38);
  }

  drawField("Name", name, infoY + 44);
  drawDivider(ctx, infoTextX, infoY + 118, infoTextW, "rgba(255,255,255,0.10)");

  drawField("Category", category, infoY + 132, 36, 22);
  drawDivider(ctx, infoTextX, infoY + 206, infoTextW, "rgba(255,255,255,0.10)");

  drawField("Points", points.toLocaleString("en-US"), infoY + 220, 46, 24);

  const statY = infoY + infoH - 86;
  const statH = 58;
  fillRoundRect(ctx, infoTextX, statY, infoTextW, statH, 14, "rgba(255,255,255,0.03)");
  strokeRoundRect(ctx, infoTextX, statY, infoTextW, statH, 14, "rgba(255,255,255,0.08)", 1);

  const midX = infoTextX + infoTextW / 2;
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.moveTo(midX, statY + 10);
  ctx.lineTo(midX, statY + statH - 10);
  ctx.stroke();
  ctx.restore();

  ctx.font = "bold 11px RobotoBold";
  ctx.fillStyle = "rgba(236,240,247,0.44)";
  ctx.fillText("TEAM", infoTextX + 18, statY + 18);
  ctx.fillText("CTF", midX + 18, statY + 18);

  const teamText = team == null ? "-" : String(team);
  const ctfText = ctf == null ? "-" : String(ctf);

  const teamSize = fitText(ctx, teamText, infoTextW / 2 - 36, 26, 16, "RobotoBold", "bold");
  ctx.font = `bold ${teamSize}px RobotoBold`;
  ctx.fillStyle = "rgba(236,240,247,0.94)";
  ctx.fillText(teamText, infoTextX + 18, statY + 47);

  const ctfSize = fitText(ctx, ctfText, infoTextW / 2 - 36, 26, 16, "RobotoBold", "bold");
  ctx.font = `bold ${ctfSize}px RobotoBold`;
  ctx.fillText(ctfText, midX + 18, statY + 47);

  ctx.font = "13px Roboto";
  ctx.fillStyle = "rgba(236,240,247,0.48)";
  ctx.fillText("Certified | Verified | Generated by rank-bot", cardX + 36, cardY + cardH - 16);

  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
