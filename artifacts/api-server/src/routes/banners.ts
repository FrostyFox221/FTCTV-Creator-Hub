import { Router } from "express";
import { db } from "@workspace/db";
import { bannersTable, insertBannerSchema } from "@workspace/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "./admin";

const router = Router();

router.get("/banners", async (_req, res) => {
  const items = await db.select().from(bannersTable).orderBy(asc(bannersTable.sortOrder), asc(bannersTable.createdAt));
  res.json(items);
});

router.post("/banners", requireAdmin, async (req, res) => {
  const parsed = insertBannerSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: "Invalid input" }); return; }
  const [{ id: newId }] = await db.insert(bannersTable).values(parsed.data).$returningId();
  const [item] = await db.select().from(bannersTable).where(eq(bannersTable.id, newId));
  res.status(201).json(item);
});

router.put("/banners/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parsed = insertBannerSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: "Invalid input" }); return; }
  await db.update(bannersTable).set(parsed.data).where(eq(bannersTable.id, id));
  const [item] = await db.select().from(bannersTable).where(eq(bannersTable.id, id));
  if (!item) { res.status(404).json({ message: "Not found" }); return; }
  res.json(item);
});

router.delete("/banners/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  await db.delete(bannersTable).where(eq(bannersTable.id, id));
  res.json({ message: "Deleted" });
});

export default router;
