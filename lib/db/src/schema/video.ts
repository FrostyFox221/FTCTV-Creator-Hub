import { mysqlTable, text, int, varchar, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const videosTable = mysqlTable("videos", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  duration: varchar("duration", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const videoPlaylistsTable = mysqlTable("video_playlists", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  coverUrl: text("cover_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const videoPlaylistItemsTable = mysqlTable("video_playlist_items", {
  id: int("id").primaryKey().autoincrement(),
  playlistId: int("playlist_id").notNull(),
  videoId: int("video_id").notNull(),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVideoSchema = createInsertSchema(videosTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videosTable.$inferSelect;

export const insertVideoPlaylistSchema = createInsertSchema(videoPlaylistsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVideoPlaylist = z.infer<typeof insertVideoPlaylistSchema>;
export type VideoPlaylist = typeof videoPlaylistsTable.$inferSelect;

export const insertVideoPlaylistItemSchema = createInsertSchema(videoPlaylistItemsTable).omit({ id: true, createdAt: true });
export type InsertVideoPlaylistItem = z.infer<typeof insertVideoPlaylistItemSchema>;
export type VideoPlaylistItem = typeof videoPlaylistItemsTable.$inferSelect;
