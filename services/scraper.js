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

    // 🔥 check if username exists on page
    const pageText = $("body").text();

    if (!pageText.includes(username)) {
      return null;
    }

    // avatar (best effort)
    let avatar = $("img").first().attr("src") || "";

    // points fallback (THM hides real points now)
    // we'll use rank number as pseudo points
    let points = 0;

    const rankMatch = pageText.match(/Rank\s*(\d+)/i);
    if (rankMatch) {
      points = parseInt(rankMatch[1]);
    }

    return {
      points,
      avatar
    };

  } catch (err) {
    console.error("Scraper error:", err.message);
    return null;
  }
}

module.exports = { getTHMProfile };
