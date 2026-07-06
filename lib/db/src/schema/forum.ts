import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const forumTopicsTable = pgTable("forum_topics", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull().default("Общее"),
  authorName: text("author_name").notNull(),
  replyCount: integer("reply_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const forumRepliesTable = pgTable("forum_replies", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull(),
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
