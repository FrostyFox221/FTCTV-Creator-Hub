import { Router } from "express";
import { db } from "@workspace/db";
import { livestreamTable, livestreamSourceTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateLivestreamBody } from "@workspace/api-zod";

const router = Router();

const ADMIN_TOKEN = "Ftc!_9AdMin#2026_xZq";

function verifyAdmin(req: any): boolean {
  const auth = req.headers["x-admin-token"] || req.headers["authorization"];
  if (!auth) return false;
  const token = typeof auth === "string" && auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  return token === ADMIN_TOKEN;
}

async function ensureLivestream() {
  const existing = await db.select().from(livestreamTable).limit(1);
  if (existing.length === 0) {
    const [{ id: newId }] = await db.insert(livestreamTable).values({ isLive: false }).$returningId();
    const [row] = await db.select().from(livestreamTable).where(eq(livestreamTable.id, newId));
    return row;
  }
  return existing[0];
}

router.get("/livestream", async (req, res) => {
  try {
    const ls = await ensureLivestream();
    return res.json({
      id: ls.id,
      isLive: ls.isLive,
      streamUrl: ls.streamUrl ?? null,
      streamType: ls.streamType ?? null,
      title: ls.title ?? null,
      description: ls.description ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Livestream get error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/livestream", async (req, res) => {
  if (!verifyAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
  try {
    const body = UpdateLivestreamBody.parse(req.body);
    const ls = await ensureLivestream();
    await db.update(livestreamTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(livestreamTable.id, ls.id));
    const [updated] = await db.select().from(livestreamTable).where(eq(livestreamTable.id, ls.id));
    return res.json({
      id: updated.id,
      isLive: updated.isLive,
      streamUrl: updated.streamUrl ?? null,
      streamType: updated.streamType ?? null,
      title: updated.title ?? null,
      description: updated.description ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Livestream update error");
    return res.status(500).json({ error: "Internal server error" });
  }
});


// --- Livestream Sources ---

router.get("/livestream/sources", async (req, res) => {
  try {
    const sources = await db.select().from(livestreamSourceTable);
    return res.json(sources);
  } catch (err) {
    req.log.error({ err }, "Livestream sources get error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/livestream/sources", async (req, res) => {
  if (!verifyAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
  try {
    const { label, streamUrl, streamType } = req.body;
    if (!label || !streamUrl || !streamType) return res.status(400).json({ error: "label, streamUrl, streamType required" });
    const [{ id }] = await db.insert(livestreamSourceTable).values({ label, streamUrl, streamType, isActive: false }).$returningId();
    const [row] = await db.select().from(livestreamSourceTable).where(eq(livestreamSourceTable.id, id));
    return res.json(row);
  } catch (err) {
    req.log.error({ err }, "Livestream source create error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/livestream/sources/:id", async (req, res) => {
  if (!verifyAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
  try {
    const id = Number(req.params.id);
    await db.delete(livestreamSourceTable).where(eq(livestreamSourceTable.id, id));
    return res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Livestream source delete error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/livestream/sources/:id/activate", async (req, res) => {
  if (!verifyAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
  try {
    const id = Number(req.params.id);
    // Deactivate all
    await db.update(livestreamSourceTable).set({ isActive: false });
    // Activate selected
    await db.update(livestreamSourceTable).set({ isActive: true }).where(eq(livestreamSourceTable.id, id));
    // Get source and update main livestream
    const [source] = await db.select().from(livestreamSourceTable).where(eq(livestreamSourceTable.id, id));
    if (source) {
      const ls = await ensureLivestream();
      await db.update(livestreamTable)
        .set({ streamUrl: source.streamUrl, streamType: source.streamType, updatedAt: new Date() })
        .where(eq(livestreamTable.id, ls.id));
    }
    const sources = await db.select().from(livestreamSourceTable);
    return res.json(sources);
  } catch (err) {
    req.log.error({ err }, "Livestream source activate error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
