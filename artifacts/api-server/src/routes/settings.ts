import { Router } from "express";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateSettingsBody } from "@workspace/api-zod";

const router = Router();

const ADMIN_TOKEN = "Ftc!_9AdMin#2026_xZq";

function verifyAdmin(req: any): boolean {
  const auth = req.headers["x-admin-token"] || req.headers["authorization"];
  if (!auth) return false;
  const token = typeof auth === "string" && auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  return token === ADMIN_TOKEN;
}

async function ensureSettings() {
  const existing = await db.select().from(settingsTable).limit(1);
  if (existing.length === 0) {
    const [row] = await db.insert(settingsTable).values({
      siteName: "FTCTV.Online",
      telegramChannel: "@ftctv.itv",
      telegramBotToken: "8797996336:AAHV9B4xUfQczTKF9TctQJ5lvwOUeFu4r0M",
      footerText: "FTC CREATE PRODUCTION 2026. Все права защищены.",
      contactEmail: "ftcmedia@mail.com",
      autoSyncEnabled: true,
      syncIntervalMinutes: 5,
    }).returning();
    return row;
  }
  return existing[0];
}

router.get("/settings", async (req, res) => {
  try {
    const cfg = await ensureSettings();
    res.json({
      id: cfg.id,
      siteName: cfg.siteName,
      logoUrl: cfg.logoUrl ?? null,
      telegramChannel: cfg.telegramChannel,
      telegramBotToken: cfg.telegramBotToken ?? null,
      footerText: cfg.footerText,
      contactEmail: cfg.contactEmail,
      autoSyncEnabled: cfg.autoSyncEnabled,
      syncIntervalMinutes: cfg.syncIntervalMinutes,
      bannerEnabled: cfg.bannerEnabled,
      bannerTitle: cfg.bannerTitle ?? null,
      bannerText: cfg.bannerText ?? null,
      bannerImageUrl: cfg.bannerImageUrl ?? null,
      bannerLink: cfg.bannerLink ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Settings get error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/settings", async (req, res) => {
  if (!verifyAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
  try {
    const body = UpdateSettingsBody.parse(req.body);
    const cfg = await ensureSettings();
    const [updated] = await db.update(settingsTable)
      .set(body)
      .where(eq(settingsTable.id, cfg.id))
      .returning();
    res.json({
      id: updated.id,
      siteName: updated.siteName,
      logoUrl: updated.logoUrl ?? null,
      telegramChannel: updated.telegramChannel,
      telegramBotToken: updated.telegramBotToken ?? null,
      footerText: updated.footerText,
      contactEmail: updated.contactEmail,
      autoSyncEnabled: updated.autoSyncEnabled,
      syncIntervalMinutes: updated.syncIntervalMinutes,
      bannerEnabled: updated.bannerEnabled,
      bannerTitle: updated.bannerTitle ?? null,
      bannerText: updated.bannerText ?? null,
      bannerImageUrl: updated.bannerImageUrl ?? null,
      bannerLink: updated.bannerLink ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Settings update error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
