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
  if (points >= 10000)  return "D";
  return "E";
}

function getRankColor(rank) {
  switch (rank) {
    case "S": return "#e11d48"; // red
    case "A": return "#7c3aed"; // purple
    case "B": return "#0284c7"; // blue
    case "C": return "#16a34a"; // green
    default:  return "#475569"; // slate
  }
}

// ── Default team info (same for everyone) ────────────────────────────────────
const DEFAULT_TEAM = "morvax60";
const DEFAULT_CTFS = "10";

async function generateCard(user) {
  const width  = 1280;
  const height = 720;
  const canvas = createCanvas(width, height);
  const ctx    = canvas.getContext("2d");

  // Background template
  const template = await loadImage(
    path.join(__dirname, "../assets/license-template.png")
  );
  ctx.drawImage(template, 0, 0, width, height);

  // Avatar
  try {
    const avatar = await loadImage(user.avatar);
    ctx.drawImage(avatar, 80, 145, 250, 300);
  } catch {}

  const licenseNo = String(user.points).padStart(10, "0");
  const rank      = getRank(user.points);
  const color     = getRankColor(rank);

  // helper: "Label : " black + value in rank color
  function inlineField(label, value, x, y, fontSize = 52) {
    ctx.font      = `bold ${fontSize}px RobotoBold`;
    ctx.fillStyle = "#111";
    ctx.fillText(label, x, y);
    const lw = ctx.measureText(label).width;
    ctx.fillStyle = color;
    ctx.fillText(value, x + lw, y);
  }

  // ── RANK — top right corner (where red box is marked) ────────────────────
  inlineField("Rank : ", `[ ${rank} ]`, 920, 115, 48);

  // ── LICENSE NO ───────────────────────────────────────────────────────────
  inlineField("License No. : ", licenseNo, 460, 210, 52);

  // ── NAME ─────────────────────────────────────────────────────────────────
  inlineField("Name : ", `[${user.thmUsername}]`, 460, 310, 56);

  // ── CATEGORY ─────────────────────────────────────────────────────────────
  inlineField("Category : ", user.category || "Hacker", 460, 390, 48);

  // ── TEAMNAME (left) + CTFs (right), same row ─────────────────────────────
  inlineField("teamname : ", DEFAULT_TEAM, 460, 470, 44);
  inlineField("ctfs : ", DEFAULT_CTFS, 850, 470, 44);

  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
