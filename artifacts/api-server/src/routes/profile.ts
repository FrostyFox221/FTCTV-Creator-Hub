import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { commentsTable } from "@workspace/db/schema";
import { forumTopicsTable, forumRepliesTable } from "@workspace/db/schema";
import { articlesTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

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

// Get current user profile
router.get("/profile/me", async (req, res) => {
  const tokenUser = getUserFromToken(req);
  if (!tokenUser) { res.status(401).json({ message: "Unauthorized" }); return; }

  const [user] = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      displayName: usersTable.displayName,
      avatarUrl: usersTable.avatarUrl,
      email: usersTable.email,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.username, tokenUser.username));

  if (!user) { res.status(404).json({ message: "User not found" }); return; }
  res.json(user);
});

// Get user activity stats
router.get("/profile/me/stats", async (req, res) => {
  const tokenUser = getUserFromToken(req);
  if (!tokenUser) { res.status(401).json({ message: "Unauthorized" }); return; }

  const [user] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.username, tokenUser.username));

  if (!user) { res.status(404).json({ message: "User not found" }); return; }

  // Count comments
  const [commentsResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(commentsTable)
    .where(eq(commentsTable.userId, user.id));

  // Count forum topics by authorName (username)
  const [topicsResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(forumTopicsTable)
    .where(eq(forumTopicsTable.authorName, tokenUser.username));

  // Count forum replies by authorName
  const [repliesResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(forumRepliesTable)
    .where(eq(forumRepliesTable.authorName, tokenUser.username));

  // Count articles by authorName
  const [articlesResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(articlesTable)
    .where(eq(articlesTable.authorName, tokenUser.username));

  res.json({
    commentsCount: Number(commentsResult?.count ?? 0),
    forumTopicsCount: Number(topicsResult?.count ?? 0),
    forumRepliesCount: Number(repliesResult?.count ?? 0),
    articlesCount: Number(articlesResult?.count ?? 0),
  });
});

// Update profile (displayName, avatarUrl)
router.patch("/profile/me", async (req, res) => {
  const tokenUser = getUserFromToken(req);
  if (!tokenUser) { res.status(401).json({ message: "Unauthorized" }); return; }

  const { displayName, avatarUrl } = req.body ?? {};
  const updates: any = {};

  if (typeof displayName === "string" && displayName.length >= 2 && displayName.length <= 50) {
    updates.displayName = displayName;
  }
  if (typeof avatarUrl === "string") {
    updates.avatarUrl = avatarUrl || null;
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ message: "Нет данных для обновления" }); return;
  }

  await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.username, tokenUser.username));

  const [user] = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      displayName: usersTable.displayName,
      avatarUrl: usersTable.avatarUrl,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.username, tokenUser.username));

  if (!user) { res.status(404).json({ message: "User not found" }); return; }
  res.json(user);
});

// Get public profile by username
router.get("/profile/:username", async (req, res) => {
  const [user] = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      displayName: usersTable.displayName,
      avatarUrl: usersTable.avatarUrl,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.username, req.params.username));

  if (!user) { res.status(404).json({ message: "User not found" }); return; }
  res.json(user);
});

export default router;
