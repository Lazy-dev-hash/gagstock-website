const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());

const endpoints = {
  gearSeeds: "https://growagardenstock.com/api/stock?type=gear-seeds",
  egg: "https://growagardenstock.com/api/stock?type=egg",
  weather: "https://growagardenstock.com/api/stock/weather",
  honey: "http://65.108.103.151:22377/api/stocks?type=honeyStock",
  cosmetics: "https://growagardenstock.com/api/special-stock?type=cosmetics",
  seedsEmoji: "http://65.108.103.151:22377/api/stocks?type=seedsStock"
};

app.get("/api/:type", async (req, res) => {
  const { type } = req.params;
  const url = endpoints[type];
  if (!url) return res.status(404).json({ error: "Invalid API type." });

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    console.error(`[Proxy error] ${type}:`, err.message);
    res.status(500).json({ error: "Failed to fetch data." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running: http://localhost:${PORT}`);
});
