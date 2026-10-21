import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { sendRegistrationNotification } from "../utils/mailer.js";
const router = Router();

function makeToken(username: string, displayName: string, userId: number): string {
  const payload = { username, displayName, userId, iat: Date.now() };
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

router.post("/auth/register", async (req, res) => {
  const { username, displayName, password, email } = req.body ?? {};
  if (typeof username !== "string" || username.length < 3 || username.length > 30 || !/^[a-zA-Z0-9_]+$/.test(username)) {
    res.status(400).json({ message: "Логин: 3–30 символов, только латиница, цифры и _" });
    return;
  }
  if (typeof displayName !== "string" || displayName.length < 2 || displayName.length > 50) {
    res.status(400).json({ message: "Имя: 2–50 символов" });
    return;
  }
  if (typeof password !== "string" || password.length < 6) {
    res.status(400).json({ message: "Пароль: минимум 6 символов" });
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== "string" || !emailRegex.test(email)) {
    res.status(400).json({ message: "Укажите корректный email" });
    return;
  }


  const existing = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.username, username));
  if (existing.length > 0) {
    res.status(400).json({ message: "Этот логин уже занят" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [{ id: newId }] = await db.insert(usersTable).values({ username, displayName, passwordHash, email }).$returningId();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, newId));


  const token = makeToken(user.username, user.displayName, user.id);
  res.status(201).json({ token, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl });

  // Non-blocking: send registration notification email
  sendRegistrationNotification({ username: user.username, displayName: user.displayName, email });
});

router.post("/auth/login", async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    res.status(400).json({ message: "Неверные данные" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (!user) {
    res.status(401).json({ message: "Неверный логин или пароль" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ message: "Неверный логин или пароль" });
    return;
  }

  const token = makeToken(user.username, user.displayName, user.id);
  res.json({ token, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl });
});

export default router;
