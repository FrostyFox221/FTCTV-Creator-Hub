import { Router } from "express";
import { db } from "@workspace/db";
import {
  galleryFoldersTable,
  galleryPhotosTable,
  insertGalleryFolderSchema,
  insertGalleryPhotoSchema,
} from "@workspace/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { requireAdmin } from "./admin";

const router = Router();

// === Folders ===

router.get("/gallery/folders", async (_req, res) => {
  const items = await db.select().from(galleryFoldersTable).orderBy(desc(galleryFoldersTable.createdAt));
  res.json(items);
});

router.get("/gallery/folders/:id", async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [folder] = await db.select().from(galleryFoldersTable).where(eq(galleryFoldersTable.id, id));
  if (!folder) { res.status(404).json({ message: "Folder not found" }); return; }
  const photos = await db.select().from(galleryPhotosTable)
    .where(eq(galleryPhotosTable.folderId, id))
    .orderBy(asc(galleryPhotosTable.sortOrder), asc(galleryPhotosTable.createdAt));
  res.json({ ...folder, photos });
});

router.post("/gallery/folders", requireAdmin, async (req, res) => {
  const parsed = insertGalleryFolderSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: "Invalid input" }); return; }
  const [{ id: newId }] = await db.insert(galleryFoldersTable).values(parsed.data).$returningId();
  const [item] = await db.select().from(galleryFoldersTable).where(eq(galleryFoldersTable.id, newId));
  res.status(201).json(item);
});

router.put("/gallery/folders/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parsed = insertGalleryFolderSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: "Invalid input" }); return; }
  await db.update(galleryFoldersTable).set(parsed.data).where(eq(galleryFoldersTable.id, id));
  const [item] = await db.select().from(galleryFoldersTable).where(eq(galleryFoldersTable.id, id));
  if (!item) { res.status(404).json({ message: "Not found" }); return; }
  res.json(item);
});

router.delete("/gallery/folders/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  await db.delete(galleryPhotosTable).where(eq(galleryPhotosTable.folderId, id));
  await db.delete(galleryFoldersTable).where(eq(galleryFoldersTable.id, id));
  res.json({ message: "Deleted" });
});

// === Photos ===

router.post("/gallery/photos", requireAdmin, async (req, res) => {
  const parsed = insertGalleryPhotoSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: "Invalid input" }); return; }
  const [{ id: newId }] = await db.insert(galleryPhotosTable).values(parsed.data).$returningId();
  const [item] = await db.select().from(galleryPhotosTable).where(eq(galleryPhotosTable.id, newId));
  res.status(201).json(item);
});

router.put("/gallery/photos/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parsed = insertGalleryPhotoSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: "Invalid input" }); return; }
  await db.update(galleryPhotosTable).set(parsed.data).where(eq(galleryPhotosTable.id, id));
  const [item] = await db.select().from(galleryPhotosTable).where(eq(galleryPhotosTable.id, id));
  if (!item) { res.status(404).json({ message: "Not found" }); return; }
  res.json(item);
});

router.delete("/gallery/photos/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  await db.delete(galleryPhotosTable).where(eq(galleryPhotosTable.id, id));
  res.json({ message: "Deleted" });
});

export default router;
