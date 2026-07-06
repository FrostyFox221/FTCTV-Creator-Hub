import { Router } from "express";
import { db } from "@workspace/db";
import { articlesTable, insertArticleSchema } from "@workspace/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireAdmin } from "./admin";

const router = Router();

router.get("/articles", async (req, res) => {
  const isAdmin = req.headers["x-admin-token"] === process.env.ADMIN_TOKEN;
  const items = await db
    .select()
    .from(articlesTable)
    .where(isAdmin ? undefined : eq(articlesTable.published, true))
    .orderBy(desc(articlesTable.createdAt));
  res.json({ articles: items, total: items.length });
});

router.get("/articles/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [item] = await db
    .select()
    .from(articlesTable)
    .where(eq(articlesTable.id, id));
  if (!item) { res.status(404).json({ message: "Not found" }); return; }
  res.json(item);
});

router.post("/articles", requireAdmin, async (req, res) => {
  const parsed = insertArticleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input" });
    return;
  }
  const [item] = await db.insert(articlesTable).values(parsed.data).returning();
  res.status(201).json(item);
});

router.put("/articles/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = insertArticleSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input" });
    return;
  }
  const [item] = await db
    .update(articlesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(articlesTable.id, id))
    .returning();
  if (!item) { res.status(404).json({ message: "Not found" }); return; }
  res.json(item);
});

router.delete("/articles/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(articlesTable).where(eq(articlesTable.id, id));
  res.json({ message: "Deleted" });
});

export default router;
