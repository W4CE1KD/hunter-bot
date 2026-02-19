function getRank(points) {

  if (points >= 150000) return "S-RANK";
  if (points >= 100000) return "A-RANK";
  if (points >= 60000) return "B-RANK";
  if (points >= 30000) return "C-RANK";
  if (points >= 10000) return "D-RANK";

  return "E-RANK";
}

module.exports = { getRank };
