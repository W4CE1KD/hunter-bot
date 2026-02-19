function getRank(points) {
  if (points >= 140000) return { letter: "N", title: "Monarch", color: "#001f3f" };
  if (points >= 80000) return { letter: "S", title: "Shadow Commander", color: "#FFD700" };
  if (points >= 40000) return { letter: "A", title: "High-Class Hunter", color: "#ff4c4c" };
  if (points >= 15000) return { letter: "B", title: "Elite Hunter", color: "#9b59b6" };
  if (points >= 5000) return { letter: "C", title: "Skilled Hunter", color: "#3498db" };
  if (points >= 1000) return { letter: "D", title: "Rising Hunter", color: "#2ecc71" };
  return { letter: "E", title: "Beginner Hunter", color: "#95a5a6" };
}

module.exports = { getRank };
