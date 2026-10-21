import { Router } from "express";
import { db } from "@workspace/db";
import {
  videosTable,
  videoPlaylistsTable,
  videoPlaylistItemsTable,
  insertVideoSchema,
  insertVideoPlaylistSchema,
  insertVideoPlaylistItemSchema,
} from "@workspace/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { requireAdmin } from "./admin";

const router = Router();

// === Videos ===

router.get("/videos", async (_req, res) => {
  const items = await db.select().from(videosTable).orderBy(desc(videosTable.createdAt));
  res.json(items);
});

router.get("/videos/:id", async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [item] = await db.select().from(videosTable).where(eq(videosTable.id, id));
  if (!item) { res.status(404).json({ message: "Video not found" }); return; }
  res.json(item);
});

router.post("/videos", requireAdmin, async (req, res) => {
  const parsed = insertVideoSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: "Invalid input" }); return; }
  const [{ id: newId }] = await db.insert(videosTable).values(parsed.data).$returningId();
  const [item] = await db.select().from(videosTable).where(eq(videosTable.id, newId));
  res.status(201).json(item);
});

router.put("/videos/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parsed = insertVideoSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: "Invalid input" }); return; }
  await db.update(videosTable).set(parsed.data).where(eq(videosTable.id, id));
  const [item] = await db.select().from(videosTable).where(eq(videosTable.id, id));
  if (!item) { res.status(404).json({ message: "Not found" }); return; }
  res.json(item);
});

router.delete("/videos/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  await db.delete(videoPlaylistItemsTable).where(eq(videoPlaylistItemsTable.videoId, id));
  await db.delete(videosTable).where(eq(videosTable.id, id));
  res.json({ message: "Deleted" });
});

// === Playlists ===

router.get("/video-playlists", async (_req, res) => {
  const items = await db.select().from(videoPlaylistsTable).orderBy(desc(videoPlaylistsTable.createdAt));
  res.json(items);
});

router.get("/video-playlists/:id", async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [playlist] = await db.select().from(videoPlaylistsTable).where(eq(videoPlaylistsTable.id, id));
  if (!playlist) { res.status(404).json({ message: "Playlist not found" }); return; }
  const items = await db.select({
    id: videoPlaylistItemsTable.id,
    videoId: videoPlaylistItemsTable.videoId,
    sortOrder: videoPlaylistItemsTable.sortOrder,
    title: videosTable.title,
    description: videosTable.description,
    videoUrl: videosTable.videoUrl,
    thumbnailUrl: videosTable.thumbnailUrl,
    duration: videosTable.duration,
  })
    .from(videoPlaylistItemsTable)
    .innerJoin(videosTable, eq(videoPlaylistItemsTable.videoId, videosTable.id))
    .where(eq(videoPlaylistItemsTable.playlistId, id))
    .orderBy(asc(videoPlaylistItemsTable.sortOrder));
  res.json({ ...playlist, videos: items });
});

router.post("/video-playlists", requireAdmin, async (req, res) => {
  const parsed = insertVideoPlaylistSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: "Invalid input" }); return; }
  const [{ id: newId }] = await db.insert(videoPlaylistsTable).values(parsed.data).$returningId();
  const [item] = await db.select().from(videoPlaylistsTable).where(eq(videoPlaylistsTable.id, newId));
  res.status(201).json(item);
});

router.put("/video-playlists/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parsed = insertVideoPlaylistSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: "Invalid input" }); return; }
  await db.update(videoPlaylistsTable).set(parsed.data).where(eq(videoPlaylistsTable.id, id));
  const [item] = await db.select().from(videoPlaylistsTable).where(eq(videoPlaylistsTable.id, id));
  if (!item) { res.status(404).json({ message: "Not found" }); return; }
  res.json(item);
});

router.delete("/video-playlists/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  await db.delete(videoPlaylistItemsTable).where(eq(videoPlaylistItemsTable.playlistId, id));
  await db.delete(videoPlaylistsTable).where(eq(videoPlaylistsTable.id, id));
  res.json({ message: "Deleted" });
});

// === Playlist Items ===

router.post("/video-playlist-items", requireAdmin, async (req, res) => {
  const parsed = insertVideoPlaylistItemSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: "Invalid input" }); return; }
  const [{ id: newId }] = await db.insert(videoPlaylistItemsTable).values(parsed.data).$returningId();
  const [item] = await db.select().from(videoPlaylistItemsTable).where(eq(videoPlaylistItemsTable.id, newId));
  res.status(201).json(item);
});

router.delete("/video-playlist-items/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  await db.delete(videoPlaylistItemsTable).where(eq(videoPlaylistItemsTable.id, id));
  res.json({ message: "Deleted" });
});


// === Reorder Playlist Items ===

router.put("/video-playlists/:id/reorder", requireAdmin, async (req, res) => {
  const playlistId = parseInt(req.params.id as string);
  const { itemIds } = req.body as { itemIds: number[] };
  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    res.status(400).json({ message: "itemIds must be a non-empty array" });
    return;
  }
  // Verify all items belong to this playlist
  const existing = await db.select({ id: videoPlaylistItemsTable.id })
    .from(videoPlaylistItemsTable)
    .where(eq(videoPlaylistItemsTable.playlistId, playlistId));
  const existingIds = new Set(existing.map(e => e.id));
  const allBelong = itemIds.every(id => existingIds.has(id));
  if (!allBelong || itemIds.length !== existingIds.size) {
    res.status(400).json({ message: "Invalid item IDs for this playlist" });
    return;
  }
  // Update sort order
  for (let i = 0; i < itemIds.length; i++) {
    await db.update(videoPlaylistItemsTable)
      .set({ sortOrder: i })
      .where(eq(videoPlaylistItemsTable.id, itemIds[i]));
  }
  // Return updated playlist
  const items = await db.select({
    id: videoPlaylistItemsTable.id,
    videoId: videoPlaylistItemsTable.videoId,
    sortOrder: videoPlaylistItemsTable.sortOrder,
    title: videosTable.title,
    thumbnailUrl: videosTable.thumbnailUrl,
  })
    .from(videoPlaylistItemsTable)
    .innerJoin(videosTable, eq(videoPlaylistItemsTable.videoId, videosTable.id))
    .where(eq(videoPlaylistItemsTable.playlistId, playlistId))
    .orderBy(asc(videoPlaylistItemsTable.sortOrder));
  res.json({ items });
});

export default router;
