import { Router } from "express";
import { db } from "@workspace/db";
import { forumTopicsTable, forumRepliesTable, insertForumTopicSchema, insertForumReplySchema } from "@workspace/db/schema";
import { eq, desc, asc, sql } from "drizzle-orm";
import { requireAdmin } from "./admin";
import { z } from "zod/v4";

const router = Router();

router.get("/forum/topics", async (_req, res) => {
  const topics = await db
    .select()
    .from(forumTopicsTable)
    .orderBy(desc(forumTopicsTable.createdAt));
  res.json({ topics, total: topics.length });
});

router.get("/forum/topics/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [topic] = await db
    .select()
    .from(forumTopicsTable)
    .where(eq(forumTopicsTable.id, id));
  if (!topic) { res.status(404).json({ message: "Not found" }); return; }
  const replies = await db
    .select()
    .from(forumRepliesTable)
    .where(eq(forumRepliesTable.topicId, id))
    .orderBy(asc(forumRepliesTable.createdAt));
  res.json({ topic, replies });
});

router.post("/forum/topics", async (req, res) => {
  const parsed = insertForumTopicSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input" });
    return;
  }
  const [topic] = await db.insert(forumTopicsTable).values(parsed.data).returning();
  res.status(201).json(topic);
});

router.post("/forum/topics/:id/replies", async (req, res) => {
  const topicId = parseInt(req.params.id);
  const [topic] = await db.select().from(forumTopicsTable).where(eq(forumTopicsTable.id, topicId));
  if (!topic) { res.status(404).json({ message: "Not found" }); return; }

  const parsed = insertForumReplySchema.safeParse({ ...req.body, topicId });
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input" });
    return;
  }
  const [reply] = await db.insert(forumRepliesTable).values(parsed.data).returning();
  await db
    .update(forumTopicsTable)
    .set({ replyCount: sql`${forumTopicsTable.replyCount} + 1` })
    .where(eq(forumTopicsTable.id, topicId));
  res.status(201).json(reply);
});

router.delete("/forum/topics/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(forumRepliesTable).where(eq(forumRepliesTable.topicId, id));
  await db.delete(forumTopicsTable).where(eq(forumTopicsTable.id, id));
  res.json({ message: "Deleted" });
});

router.delete("/forum/replies/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const [reply] = await db.select().from(forumRepliesTable).where(eq(forumRepliesTable.id, id));
  if (reply) {
    await db.delete(forumRepliesTable).where(eq(forumRepliesTable.id, id));
    await db
      .update(forumTopicsTable)
      .set({ replyCount: sql`GREATEST(${forumTopicsTable.replyCount} - 1, 0)` })
      .where(eq(forumTopicsTable.id, reply.topicId));
  }
  res.json({ message: "Deleted" });
});

export default router;
