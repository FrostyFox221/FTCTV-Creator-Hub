import { Router } from "express";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "./admin";

const router = Router();

async function getSettings() {
  const rows = await db.select().from(settingsTable).limit(1);
  return rows[0] ?? null;
}

function getAutoMaintenanceStatus(): { isActive: boolean; endsAt: string | null } {
  // Regular schedule: every 18th of the month 00:00–06:00 UTC+10
  const UTC_OFFSET_MS = 10 * 60 * 60 * 1000;
  const now = new Date();
  const nowUtc7 = new Date(now.getTime() + UTC_OFFSET_MS);
  const day = nowUtc7.getUTCDate();
  const hours = nowUtc7.getUTCHours();
  const isMaintenanceDay = day === 18;
  const isMaintenanceHour = hours >= 0 && hours < 6;
  const isActive = isMaintenanceDay && isMaintenanceHour;

  let endsAt: string | null = null;
  if (isActive) {
    const endUtc7 = new Date(nowUtc7);
    endUtc7.setUTCHours(6, 0, 0, 0);
    endsAt = new Date(endUtc7.getTime() - UTC_OFFSET_MS).toISOString();
  }
  return { isActive, endsAt };
}

async function getMaintenanceStatus(): Promise<{ isActive: boolean; endsAt: string | null; message: string }> {
  const settings = await getSettings();
  const defaultMessage = "Ведутся плановые технические работы. Сайт скоро вернётся в эфир.";

  // Manual override takes priority
  if (settings?.maintenanceManual) {
    const endsAt = settings.maintenanceEndsAt ?? null;
    // If endsAt is in the past, auto-deactivate
    if (endsAt && new Date(endsAt) < new Date()) {
      // Expired — turn off manual mode
      await db.update(settingsTable)
        .set({ maintenanceManual: false, maintenanceEndsAt: null })
        .where(eq(settingsTable.id, settings.id));
    } else {
      return {
        isActive: true,
        endsAt,
        message: settings.maintenanceMessage ?? defaultMessage,
      };
    }
  }

  const auto = getAutoMaintenanceStatus();
  return {
    isActive: auto.isActive,
    endsAt: auto.endsAt,
    message: defaultMessage,
  };
}

router.get("/maintenance", async (_req, res) => {
  res.json(await getMaintenanceStatus());
});

router.post("/maintenance/start", requireAdmin, async (req, res) => {
  const { endsAt, message } = req.body ?? {};
  if (!endsAt || typeof endsAt !== "string") {
    res.status(400).json({ message: "endsAt is required" });
    return;
  }

  const settings = await getSettings();
  if (settings) {
    await db.update(settingsTable)
      .set({
        maintenanceManual: true,
        maintenanceEndsAt: endsAt,
        maintenanceMessage: message ?? null,
      })
      .where(eq(settingsTable.id, settings.id));
  } else {
    await db.insert(settingsTable).values({
      siteName: "FTCTV.Online",
      telegramChannel: "",
      footerText: "FTC CREATE PRODUCTION 2026. Все права защищены.",
      contactEmail: "ftcmedia@mail.com",
      maintenanceManual: true,
      maintenanceEndsAt: endsAt,
      maintenanceMessage: message ?? null,
    });
  }

  res.json(await getMaintenanceStatus());
});

router.post("/maintenance/stop", requireAdmin, async (req, res) => {
  const settings = await getSettings();
  if (settings) {
    await db.update(settingsTable)
      .set({ maintenanceManual: false, maintenanceEndsAt: null, maintenanceMessage: null })
      .where(eq(settingsTable.id, settings.id));
  }
  res.json(await getMaintenanceStatus());
});

export default router;
