const axios = require("axios");
const cheerio = require("cheerio");

async function getTHMProfile(username) {
  try {
    const { data } = await axios.get(
      `https://tryhackme.com/p/${username}`,
      {
        headers: { "User-Agent": "Mozilla/5.0" }
      }
    );

    const $ = cheerio.load(data);

    const pageText = $("body").text();

    if (!pageText.includes(username)) return null;

    let avatar = $("img").first().attr("src") || "";

    // fallback points (THM hides real points)
    let points = 1000;
    const rankMatch = pageText.match(/Rank\s*(\d+)/i);

    if (rankMatch) {
      points = parseInt(rankMatch[1]);
    }

    return { points, avatar };

  } catch (err) {
    console.log("Scraper error:", err.message);
    return null;
  }
}

module.exports = { getTHMProfile };
