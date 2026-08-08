import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

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
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.username, tokenUser.username));

  if (!user) { res.status(404).json({ message: "User not found" }); return; }
  res.json(user);
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

  const [user] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.username, tokenUser.username))
    .returning({
      id: usersTable.id,
      username: usersTable.username,
      displayName: usersTable.displayName,
      avatarUrl: usersTable.avatarUrl,
      createdAt: usersTable.createdAt,
    });

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
