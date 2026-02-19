const axios = require("axios");

async function getTHMProfile(username) {
  try {

    // fetch profile page
    const { data } = await axios.get(
      `https://tryhackme.com/p/${username}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    // ===============================
    // Extract Next.js JSON data
    // ===============================
    const match = data.match(
      /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/
    );

    if (!match) {
      console.log("THM JSON not found");
      return null;
    }

    const json = JSON.parse(match[1]);

    // ===============================
    // Safe navigation (no crash)
    // ===============================
    const user =
      json?.props?.pageProps?.user || null;

    if (!user) {
      console.log("User data not found");
      return null;
    }

    // ===============================
    // Extract values
    // ===============================
    const avatar = user.avatar || "";

    // TryHackMe hides real points publicly,
    // so we use rank as fallback value
    const points = user.rank || 1000;

    return {
      avatar,
      points
    };

  } catch (err) {
    console.log("Scraper error:", err.message);
    return null;
  }
}

module.exports = { getTHMProfile };
