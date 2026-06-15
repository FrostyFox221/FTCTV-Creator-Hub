import { Router } from "express";

const router = Router();

// FORCED: maintenance active until 23:00 UTC+10 (13:00 UTC) today
const FORCED_UNTIL = new Date("2026-06-15T13:00:00.000Z");

function getMaintenanceStatus(): { isActive: boolean; endsAt: string | null; message: string } {
  const now = new Date();

  const isForcedActive = now < FORCED_UNTIL;

  if (isForcedActive) {
    return {
      isActive: true,
      endsAt: FORCED_UNTIL.toISOString(),
      message: "Ведутся плановые технические работы. Сайт скоро вернётся в эфир.",
    };
  }

  // Regular schedule: every 18th of the month 00:00–06:00 UTC+7
  const UTC_OFFSET_MS = 7 * 60 * 60 * 1000;
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

  return {
    isActive,
    endsAt,
    message: "Ведутся плановые технические работы. Сайт скоро вернётся в эфир.",
  };
}

router.get("/maintenance", (_req, res) => {
  res.json(getMaintenanceStatus());
});

export default router;
