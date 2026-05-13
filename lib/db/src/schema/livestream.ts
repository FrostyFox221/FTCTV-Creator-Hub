import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const livestreamTable = pgTable("livestream", {
  id: serial("id").primaryKey(),
  isLive: boolean("is_live").notNull().default(false),
  streamUrl: text("stream_url"),
  streamType: text("stream_type"),
  title: text("title"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLivestreamSchema = createInsertSchema(livestreamTable).omit({ id: true });
export type InsertLivestream = z.infer<typeof insertLivestreamSchema>;
export type Livestream = typeof livestreamTable.$inferSelect;
