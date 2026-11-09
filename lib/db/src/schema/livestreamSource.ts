import { mysqlTable, text, int, boolean, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const livestreamSourceTable = mysqlTable("livestream_sources", {
  id: int("id").primaryKey().autoincrement(),
  label: text("label").notNull(),
  streamUrl: text("stream_url").notNull(),
  streamType: text("stream_type").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLivestreamSourceSchema = createInsertSchema(livestreamSourceTable).omit({ id: true });
export type InsertLivestreamSource = z.infer<typeof insertLivestreamSourceSchema>;
export type LivestreamSource = typeof livestreamSourceTable.$inferSelect;
