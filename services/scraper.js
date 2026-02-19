const axios = require("axios");
const cheerio = require("cheerio");

async function getTHMProfile(username) {
  try {
    const { data } = await axios.get(
      `https://tryhackme.com/p/${username}`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );

    const $ = cheerio.load(data);

    const bodyText = $("body").text();
    const match = bodyText.match(/Total Points\s*([\d,]+)/i);

    if (!match) return null;

    const points = parseInt(match[1].replace(/,/g, ""));
    const avatar = $("img").first().attr("src");

    return { points, avatar };
  } catch {
    return null;
  }
}

module.exports = { getTHMProfile };
