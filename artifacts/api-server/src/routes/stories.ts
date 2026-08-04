import { Router } from "express";
import { db } from "@workspace/db";
import { storiesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "./admin";

const router = Router();

router.get("/stories", async (_req, res) => {
  const stories = await db.select().from(storiesTable).orderBy(storiesTable.sortOrder, storiesTable.createdAt);
  res.json(stories);
});

router.post("/stories", requireAdmin, async (req, res) => {
  const { imageUrl, title, link, sortOrder } = req.body ?? {};
  if (!imageUrl || typeof imageUrl !== "string") {
    res.status(400).json({ message: "imageUrl обязателен" });
    return;
  }
  const [story] = await db.insert(storiesTable).values({
    imageUrl,
    title: title ?? null,
    link: link ?? null,
    sortOrder: sortOrder ?? 0,
  }).returning();
  res.status(201).json(story);
});

router.delete("/stories/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params["id"]);
  if (isNaN(id)) { res.status(400).json({ message: "invalid id" }); return; }
  await db.delete(storiesTable).where(eq(storiesTable.id, id));
  res.json({ ok: true });
});

export default router;
