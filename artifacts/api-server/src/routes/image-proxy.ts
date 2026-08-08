import { Router, type Request, type Response } from "express";

const router = Router();

/**
 * GET /image-proxy?url=...
 * Proxies external images (Telegram, etc.) server-side
 * to avoid geo-blocking and URL expiration issues.
 */
router.get("/image-proxy", async (req: Request, res: Response) => {
  const url = req.query.url as string;
  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "Missing url parameter" });
    return;
  }

  // Only allow proxying from trusted domains
  const allowed = [
    "api.telegram.org",
    "telegram.org",
  ];

  try {
    const parsed = new URL(url);
    if (!allowed.some(domain => parsed.hostname.endsWith(domain))) {
      res.status(403).json({ error: "Domain not allowed" });
      return;
    }

    const response = await fetch(url);
    if (!response.ok) {
      res.status(response.status).json({ error: "Upstream error" });
      return;
    }

    const contentType = response.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: "Proxy fetch failed" });
  }
});

export default router;
