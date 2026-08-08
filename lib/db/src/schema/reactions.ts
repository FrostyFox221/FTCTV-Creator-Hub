import { pgTable, serial, integer, text, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { postsTable } from "./posts";
import { usersTable } from "./users";

export const reactionsTable = pgTable("reactions", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => postsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  type: text("type").notNull().default("like"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueReaction: unique().on(table.postId, table.userId),
}));

export const insertReactionSchema = createInsertSchema(reactionsTable).omit({ id: true, createdAt: true });
export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type Reaction = typeof reactionsTable.$inferSelect;
