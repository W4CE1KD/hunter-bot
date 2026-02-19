const axios = require("axios");

async function getTHMProfile(username) {
  try {

    const { data } = await axios.get(
      `https://tryhackme.com/api/user/profile/${username}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    if (!data || !data.username) return null;

    return {
      avatar: data.avatar || "",
      points: data.rank || 1000
    };

  } catch (err) {
    console.log("THM API error:", err.message);
    return null;
  }
}

module.exports = { getTHMProfile };
