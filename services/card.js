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

  // ── LICENSE NO ───────────────────────────────────────────────────────────
  ctx.fillStyle = "#111";
  ctx.font      = "bold 48px RobotoBold";
  ctx.fillText("License No.", 460, 170);

  ctx.strokeStyle = "#9aa3af";
  ctx.lineWidth   = 3;
  ctx.strokeRect(460, 185, 330, 58);

  ctx.fillStyle = "#111";
  ctx.font      = "bold 52px RobotoBold";
  ctx.fillText(licenseNo, 475, 230);

  // ── RANK (right of license box, same row) ────────────────────────────────
  ctx.fillStyle = "#111";
  ctx.font      = "bold 48px RobotoBold";
  ctx.fillText("Rank", 830, 170);

  ctx.fillStyle = color;
  ctx.font      = "bold 56px RobotoBold";
  ctx.fillText(`[ ${rank} ]`, 830, 232);

  // ── NAME ─────────────────────────────────────────────────────────────────
  ctx.fillStyle = "#111";
  ctx.font      = "bold 56px RobotoBold";
  ctx.fillText("Name : ", 460, 330);

  const prefixW = ctx.measureText("Name : ").width;
  ctx.fillStyle = color;
  ctx.fillText(`[${user.thmUsername}]`, 460 + prefixW, 330);

  // ── CATEGORY (label + value, no boxes, same style as name) ───────────────
  ctx.fillStyle = "#111";
  ctx.font      = "bold 48px RobotoBold";
  ctx.fillText("Category : ", 460, 400);

  const catPrefixW = ctx.measureText("Category : ").width;
  ctx.fillStyle = color;
  ctx.font      = "bold 48px RobotoBold";
  ctx.fillText(user.category || "Hacker", 460 + catPrefixW, 400);

  // ── TEAM NAME  |  CTFs ───────────────────────────────────────────────────
  // Left column: teamname
  const leftX  = 460;
  const rightX = 800;  // right column start
  const labelY = 470;  // label row
  const valueY = 525;  // value row

  // teamname label
  ctx.fillStyle = "#111";
  ctx.font      = "bold 40px RobotoBold";
  ctx.fillText("teamname :", leftX, labelY);

  // teamname value in rank color
  ctx.fillStyle = color;
  ctx.font      = "bold 44px RobotoBold";
  ctx.fillText(user.teamName || "—", leftX, valueY);

  // ctfs label
  ctx.fillStyle = "#111";
  ctx.font      = "bold 40px RobotoBold";
  ctx.fillText("ctfs :", rightX, labelY);

  // ctfs value in rank color
  ctx.fillStyle = color;
  ctx.font      = "bold 44px RobotoBold";
  ctx.fillText(String(user.ctfs ?? "0"), rightX, valueY);

  return canvas.toBuffer("image/png");
}

module.exports = { generateCard };
