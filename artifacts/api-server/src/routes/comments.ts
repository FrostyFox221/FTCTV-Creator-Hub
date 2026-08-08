import { Router } from "express";
import { db } from "@workspace/db";
import { commentsTable, usersTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

// Helper to extract user from token
function getUserFromToken(req: any): { username: string; displayName: string } | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  try {
    const payload = JSON.parse(Buffer.from(auth.slice(7), "base64url").toString());
    return { username: payload.username, displayName: payload.displayName };
  } catch {
    return null;
  }
}

// Get comments for a post
router.get("/posts/:postId/comments", async (req, res) => {
  const postId = parseInt(req.params.postId);
  if (isNaN(postId)) { res.status(400).json({ message: "Invalid postId" }); return; }

  const comments = await db
    .select({
      id: commentsTable.id,
      postId: commentsTable.postId,
      userId: commentsTable.userId,
      content: commentsTable.content,
      createdAt: commentsTable.createdAt,
      username: usersTable.username,
      displayName: usersTable.displayName,
      avatarUrl: usersTable.avatarUrl,
    })
    .from(commentsTable)
    .leftJoin(usersTable, eq(commentsTable.userId, usersTable.id))
    .where(eq(commentsTable.postId, postId))
    .orderBy(desc(commentsTable.createdAt));

  res.json(comments);
});

// Add comment to a post
router.post("/posts/:postId/comments", async (req, res) => {
  const tokenUser = getUserFromToken(req);
  if (!tokenUser) { res.status(401).json({ message: "Unauthorized" }); return; }

  const postId = parseInt(req.params.postId);
  if (isNaN(postId)) { res.status(400).json({ message: "Invalid postId" }); return; }

  const { content } = req.body ?? {};
  if (typeof content !== "string" || content.trim().length === 0 || content.length > 1000) {
    res.status(400).json({ message: "Комментарий: 1–1000 символов" }); return;
  }

  const [user] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.username, tokenUser.username));
  if (!user) { res.status(401).json({ message: "User not found" }); return; }

  const [comment] = await db.insert(commentsTable).values({ postId, userId: user.id, content: content.trim() }).returning();
  res.status(201).json({ ...comment, username: tokenUser.username, displayName: tokenUser.displayName });
});

// Delete a comment
router.delete("/comments/:id", async (req, res) => {
  const tokenUser = getUserFromToken(req);
  if (!tokenUser) { res.status(401).json({ message: "Unauthorized" }); return; }

  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ message: "Invalid id" }); return; }

  const [user] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.username, tokenUser.username));
  if (!user) { res.status(401).json({ message: "User not found" }); return; }

  const [comment] = await db.select().from(commentsTable).where(eq(commentsTable.id, id));
  if (!comment) { res.status(404).json({ message: "Not found" }); return; }
  if (comment.userId !== user.id) { res.status(403).json({ message: "Forbidden" }); return; }

  await db.delete(commentsTable).where(eq(commentsTable.id, id));
  res.json({ success: true });
});

export default router;
