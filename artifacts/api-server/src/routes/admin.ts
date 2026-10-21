import { Router } from "express";
import { AdminLoginBody } from "@workspace/api-zod";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

export const ADMIN_PASSWORD = "Ftc!_9AdMin#2026_xZq";

export function requireAdmin(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) {
  const token = req.headers["x-admin-token"];
  if (token !== ADMIN_PASSWORD) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  next();
}

router.post("/admin/login", async (req, res) => {
  try {
    const body = AdminLoginBody.parse(req.body);
    if (body.password === ADMIN_PASSWORD) {
      res.json({ success: true, token: ADMIN_PASSWORD });
    } else {
      res.status(401).json({ success: false, token: "" });
    }
  } catch (err) {
    req.log.error({ err }, "Admin login error");
    res.status(400).json({ error: "Invalid request" });
  }
});


// --- Admin User Management ---
const VALID_ROLES = ["user", "moderator", "editor", "administrator", "owner"] as const;

router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const users = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        displayName: usersTable.displayName,
        email: usersTable.email,
        role: usersTable.role,
        avatarUrl: usersTable.avatarUrl,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .orderBy(usersTable.id);
    res.json(users);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch users");
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.put("/admin/users/:id/role", requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id as string, 10);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }
    const { role } = req.body;
    if (!role || !VALID_ROLES.includes(role)) {
      res.status(400).json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` });
      return;
    }
    const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.id, userId));
    if (!existing) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    await db.update(usersTable).set({ role }).where(eq(usersTable.id, userId));
    res.json({ success: true, userId, role });
  } catch (err) {
    req.log.error({ err }, "Failed to update user role");
    res.status(500).json({ error: "Failed to update user role" });
  }
});

export default router;
