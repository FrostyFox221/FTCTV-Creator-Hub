import { Router } from "express";

const router = Router();

// Maintenance window: every 18th of the month 00:00–06:00 MSK+7 (UTC+7)
function getMaintenanceStatus(): { isActive: boolean; endsAt: string | null; message: string } {
  const now = new Date();
  // UTC+7 = MSK+4? Actually the user said MSK+7 which is UTC+10? 
  // MSK = UTC+3, MSK+7 = UTC+10? That seems odd. Let me re-read.
  // Actually the user wrote "по мск +7" which could mean "Moscow time +7" or "UTC+7"
  // MSK is UTC+3, so MSK+7 would be unusual. More likely they mean UTC+7 (Novosibirsk time).
  // Let's use UTC+7 offset.
  const UTC_OFFSET_MS = 7 * 60 * 60 * 1000;
  const nowUtc7 = new Date(now.getTime() + UTC_OFFSET_MS);
  
  const day = nowUtc7.getUTCDate();
  const hours = nowUtc7.getUTCHours();
  
  const isMaintenanceDay = day === 18;
  const isMaintenanceHour = hours >= 0 && hours < 6;
  const isActive = isMaintenanceDay && isMaintenanceHour;

  let endsAt: string | null = null;
  if (isActive) {
    // End at 06:00 UTC+7 on the 18th
    const endUtc7 = new Date(nowUtc7);
    endUtc7.setUTCHours(6, 0, 0, 0);
    // Convert back to UTC
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
