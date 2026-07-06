import { Router } from "express";
import { db } from "@workspace/db";
import { scheduleTable, insertScheduleSchema } from "@workspace/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "./admin";

const router = Router();

router.get("/schedule", async (_req, res) => {
  const items = await db
    .select()
    .from(scheduleTable)
    .orderBy(asc(scheduleTable.dayOfWeek), asc(scheduleTable.timeSlot));
  res.json(items);
});

router.post("/schedule", requireAdmin, async (req, res) => {
  const parsed = insertScheduleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input" });
    return;
  }
  const [item] = await db.insert(scheduleTable).values(parsed.data).returning();
  res.status(201).json(item);
});

router.put("/schedule/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = insertScheduleSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input" });
    return;
  }
  const [item] = await db
    .update(scheduleTable)
    .set(parsed.data)
    .where(eq(scheduleTable.id, id))
    .returning();
  if (!item) { res.status(404).json({ message: "Not found" }); return; }
  res.json(item);
});

router.delete("/schedule/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(scheduleTable).where(eq(scheduleTable.id, id));
  res.json({ message: "Deleted" });
});

export default router;
