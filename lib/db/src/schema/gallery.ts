import { mysqlTable, text, int, varchar, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const galleryFoldersTable = mysqlTable("gallery_folders", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  coverUrl: text("cover_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const galleryPhotosTable = mysqlTable("gallery_photos", {
  id: int("id").primaryKey().autoincrement(),
  folderId: int("folder_id").notNull(),
  imageUrl: text("image_url").notNull(),
  caption: varchar("caption", { length: 500 }),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGalleryFolderSchema = createInsertSchema(galleryFoldersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGalleryFolder = z.infer<typeof insertGalleryFolderSchema>;
export type GalleryFolder = typeof galleryFoldersTable.$inferSelect;

export const insertGalleryPhotoSchema = createInsertSchema(galleryPhotosTable).omit({ id: true, createdAt: true });
export type InsertGalleryPhoto = z.infer<typeof insertGalleryPhotoSchema>;
export type GalleryPhoto = typeof galleryPhotosTable.$inferSelect;
