const axios = require("axios");
const cheerio = require("cheerio");

async function getTHMProfile(username) {
  try {
    const { data } = await axios.get(
      `https://tryhackme.com/p/${username}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    const $ = cheerio.load(data);

    // 🔥 avatar selector (stable)
    const avatar =
      $('img[alt="User avatar"]').first().attr("src") || "";

    // 🔥 TryHackMe hides real points
    // using rank number as fallback
    let points = 1000;

    const bodyText = $("body").text();
    const rankMatch = bodyText.match(/Rank\s*(\d+)/i);

    if (rankMatch) {
      points = parseInt(rankMatch[1]);
    }

    return {
      points,
      avatar
    };

  } catch (err) {
    console.log("Scraper error:", err.message);
    return null;
  }
}

module.exports = { getTHMProfile };
