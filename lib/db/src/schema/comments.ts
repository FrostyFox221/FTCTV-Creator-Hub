import { mysqlTable, text, int, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { postsTable } from "./posts";
import { usersTable } from "./users";

export const commentsTable = mysqlTable("comments", {
  id: int("id").primaryKey().autoincrement(),
  postId: int("post_id").notNull().references(() => postsTable.id, { onDelete: "cascade" }),
  userId: int("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  parentId: int("parent_id").references((): any => commentsTable.id, { onDelete: "cascade" }),
});

export const insertCommentSchema = createInsertSchema(commentsTable).omit({ id: true, createdAt: true });
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof commentsTable.$inferSelect;
