import { Router } from "express";
import { db } from "@workspace/db";
import { hourlyNewsTable } from "@workspace/db";
import { eq, desc, gte } from "drizzle-orm";
import { fetchAndStoreNews, getHourlyNews } from "../services/rss-fetcher";

const router = Router();

// Public: get latest hour news
router.get("/hourly-news", async (_req, res) => {
  try {
    const limit = Math.min(Number(_req.query.limit) || 30, 100);
    const news = await getHourlyNews(limit);
    res.json(news);
  } catch (e) {
    console.error("[hourly-news] GET error:", e);
    res.status(500).json({ error: "Failed to fetch hourly news" });
  }
});

// Admin: force refresh
router.post("/hourly-news/refresh", async (req, res) => {
  const token = req.headers["x-admin-token"];
  if (token !== "Ftc!_9AdMin#2026_xZq") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const count = await fetchAndStoreNews();
    return res.json({ message: `Fetched ${count} items` });
  } catch (e) {
    console.error("[hourly-news] refresh error:", e);
    return res.status(500).json({ error: "Refresh failed" });
  }
});

// Admin: update topic for a news item
router.patch("/hourly-news/:id/topic", async (req, res) => {
  const token = req.headers["x-admin-token"];
  if (token !== "Ftc!_9AdMin#2026_xZq") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const id = Number(req.params.id);
  const { topic } = req.body;
  if (!topic || typeof topic !== "string") {
    return res.status(400).json({ error: "topic is required" });
  }
  try {
    await db.update(hourlyNewsTable).set({ topic }).where(eq(hourlyNewsTable.id, id));
    return res.json({ success: true });
  } catch (e) {
    console.error("[hourly-news] patch error:", e);
    return res.status(500).json({ error: "Update failed" });
  }
});

// Admin: hide/unhide a news item
router.patch("/hourly-news/:id/visibility", async (req, res) => {
  const token = req.headers["x-admin-token"];
  if (token !== "Ftc!_9AdMin#2026_xZq") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const id = Number(req.params.id);
  const { hidden } = req.body;
  if (typeof hidden !== "boolean") {
    return res.status(400).json({ error: "hidden must be boolean" });
  }
  try {
    await db.update(hourlyNewsTable).set({ hidden }).where(eq(hourlyNewsTable.id, id));
    return res.json({ success: true });
  } catch (e) {
    console.error("[hourly-news] visibility error:", e);
    return res.status(500).json({ error: "Update failed" });
  }
});

export default router;
