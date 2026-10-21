import { mysqlTable, text, int, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const forumTopicsTable = mysqlTable("forum_topics", {
  id: int("id").primaryKey().autoincrement(),
  title: text("title").notNull(),
  category: text("category").notNull().default("Общее"),
  authorName: text("author_name").notNull(),
  replyCount: int("reply_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const forumRepliesTable = mysqlTable("forum_replies", {
  id: int("id").primaryKey().autoincrement(),
  topicId: int("topic_id").notNull(),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertForumTopicSchema = createInsertSchema(forumTopicsTable).omit({ id: true, createdAt: true, replyCount: true });
export type InsertForumTopic = z.infer<typeof insertForumTopicSchema>;
export type ForumTopic = typeof forumTopicsTable.$inferSelect;

export const insertForumReplySchema = createInsertSchema(forumRepliesTable).omit({ id: true, createdAt: true });
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
export type ForumReply = typeof forumRepliesTable.$inferSelect;
