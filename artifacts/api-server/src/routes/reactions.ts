import { Router } from "express";
import { db } from "@workspace/db";
import { reactionsTable, usersTable } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

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

// Get reactions count for a post + whether current user reacted
router.get("/posts/:postId/reactions", async (req, res) => {
  const postId = parseInt(req.params.postId);
  if (isNaN(postId)) { res.status(400).json({ message: "Invalid postId" }); return; }

  const tokenUser = getUserFromToken(req);
  let userReacted = false;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reactionsTable)
    .where(eq(reactionsTable.postId, postId));

  if (tokenUser) {
    const [user] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.username, tokenUser.username));
    if (user) {
      const [existing] = await db.select({ id: reactionsTable.id }).from(reactionsTable)
        .where(and(eq(reactionsTable.postId, postId), eq(reactionsTable.userId, user.id)));
      userReacted = !!existing;
    }
  }

  res.json({ count: countResult?.count ?? 0, userReacted });
});

// Toggle reaction (like/unlike)
router.post("/posts/:postId/reactions", async (req, res) => {
  const tokenUser = getUserFromToken(req);
  if (!tokenUser) { res.status(401).json({ message: "Unauthorized" }); return; }

  const postId = parseInt(req.params.postId);
  if (isNaN(postId)) { res.status(400).json({ message: "Invalid postId" }); return; }

  const [user] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.username, tokenUser.username));
  if (!user) { res.status(401).json({ message: "User not found" }); return; }

  // Check if already reacted
  const [existing] = await db.select({ id: reactionsTable.id }).from(reactionsTable)
    .where(and(eq(reactionsTable.postId, postId), eq(reactionsTable.userId, user.id)));

  if (existing) {
    // Remove reaction
    await db.delete(reactionsTable).where(eq(reactionsTable.id, existing.id));
    res.json({ reacted: false });
  } else {
    // Add reaction
    await db.insert(reactionsTable).values({ postId, userId: user.id, type: "like" });
    res.json({ reacted: true });
  }
});

export default router;
