import { Router } from "express";
import { AdminLoginBody } from "@workspace/api-zod";

const router = Router();

const ADMIN_PASSWORD = "Ftc!_9AdMin#2026_xZq";

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

export default router;
