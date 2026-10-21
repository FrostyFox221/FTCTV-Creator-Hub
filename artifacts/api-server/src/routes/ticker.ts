import { Router } from "express";
import { getAllTickerData, getWeather } from "../services/ticker-cache";

const router = Router();

// GET /api/ticker?city=Москва — all ticker data
router.get("/ticker", async (req, res) => {
  try {
    const city = (req.query.city as string) || "Москва";
    const data = await getAllTickerData(city);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Ticker data unavailable" });
  }
});

// GET /api/ticker/weather?city=Москва — weather only (for city switching)
router.get("/ticker/weather", async (req, res) => {
  try {
    const city = (req.query.city as string) || "Москва";
    const weather = await getWeather(city);
    res.json({ weather });
  } catch (e) {
    res.status(500).json({ error: "Weather unavailable" });
  }
});

export default router;
