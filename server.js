const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Store stock data and last update time
let currentStockData = {};
let lastCombinedKey = null;
let lastUpdateTimestamp = Date.now(); // To track when the data was last fetched successfully

// Helper functions (same as your original code)
const getCountdown = (updatedAt, intervalSec) => {
    const now = Date.now();
    const passed = Math.floor((now - updatedAt) / 1000);
    const remaining = Math.max(intervalSec - passed, 0);
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    return `${h > 0 ? `${h}h ` : ''}${m}m ${s}s`;
};

const getHoneyRestockCountdown = () => {
    const nowPH = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
    const currentMinutes = nowPH.getMinutes();
    const currentSeconds = nowPH.getSeconds();

    const remainingMinutes = 59 - currentMinutes;
    const remainingSeconds = 60 - currentSeconds;

    const m = remainingMinutes < 10 ? `0${remainingMinutes}` : remainingMinutes;
    const s = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

    return `${m}m ${s}s`;
};

// Function to fetch all stock data
const fetchAllStockData = async () => {
    try {
        const [
            gearSeedRes,
            eggRes,
            weatherRes,
            honeyRes,
            cosmeticsRes,
            seedsEmojiRes
        ] = await Promise.all([
            axios.get("https://growagardenstock.com/api/stock?type=gear-seeds"),
            axios.get("https://growagardenstock.com/api/stock?type=egg"),
            axios.get("https://growagardenstock.com/api/stock/weather"),
            axios.get("http://65.108.103.151:22377/api/stocks?type=honeyStock"),
            axios.get("https://growagardenstock.com/api/special-stock?type=cosmetics"),
            axios.get("http://65.108.103.151:22377/api/stocks?type=seedsStock")
        ]);

        const gearSeed = gearSeedRes.data;
        const egg = eggRes.data;
        const weather = weatherRes.data;
        const honey = honeyRes.data;
        const cosmetics = cosmeticsRes.data;
        const emojiSeeds = seedsEmojiRes.data?.seedsStock || [];

        const combinedKey = JSON.stringify({
            gear: gearSeed.gear,
            seeds: gearSeed.seeds,
            egg: egg.egg,
            weather: weather.updatedAt,
            honeyStock: honey.honeyStock,
            cosmetics: cosmetics.cosmetics
        });

        if (combinedKey !== lastCombinedKey) {
            lastCombinedKey = combinedKey;
            lastUpdateTimestamp = Date.now(); // Update timestamp on successful fetch

            const gearRestock = getCountdown(gearSeed.updatedAt, 300);
            const eggRestock = getCountdown(egg.updatedAt, 600);
            const cosmeticsRestock = getCountdown(cosmetics.updatedAt, 14400);
            const honeyRestock = getHoneyRestockCountdown();

            const gearList = gearSeed.gear?.map(item => `- ${item}`).join("\n") || "No gear.";

            const seedList = gearSeed.seeds?.map(seed => {
                const name = seed.split(" **")[0];
                const matched = emojiSeeds.find(s => s.name.toLowerCase() === name.toLowerCase());
                const emoji = matched?.emoji || "";
                return `- ${emoji ? `${emoji} ` : ""}${seed}`;
            }).join("\n") || "No seeds.";

            const eggList = egg.egg?.map(item => `- ${item}`).join("\n") || "No eggs.";
            const cosmeticsList = cosmetics.cosmetics?.map(item => `- ${item}`).join("\n") || "No cosmetics.";
            const honeyList = honey.honeyStock?.map(h => `- ${h.name}: ${h.value}`).join("\n") || "No honey stock.";

            const weatherIcon = weather.icon || "🌦️";
            const weatherCurrent = weather.currentWeather || "Unknown";
            const cropBonus = weather.cropBonuses || "None";

            const weatherText = `${weatherIcon} ${weatherCurrent}`;

            currentStockData = {
                gearList,
                seedList,
                eggList,
                cosmeticsList,
                honeyList,
                weatherText,
                cropBonus,
                gearRestock,
                eggRestock,
                cosmeticsRestock,
                honeyRestock,
                lastFetched: new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
            };
            console.log("Stock data updated.");
        }
    } catch (err) {
        console.error("❌ Error fetching stock data:", err.message);
        // You might want to set an error state here or log it
    }
};

// Start fetching data immediately and then every 10 seconds
fetchAllStockData();
setInterval(fetchAllStockData, 10 * 1000); // Fetch every 10 seconds

// API endpoint to send stock data to the frontend
app.get('/api/stock', (req, res) => {
    res.json(currentStockData);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
