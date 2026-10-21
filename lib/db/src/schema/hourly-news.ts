import { mysqlTable, text, int, varchar, timestamp, boolean } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const hourlyNewsTable = mysqlTable("hourly_news", {
  id: int("id").primaryKey().autoincrement(),
  title: text("title").notNull(),
  summary: text("summary"),
  sourceUrl: text("source_url").notNull(),
  sourceName: varchar("source_name", { length: 100 }).notNull(),
  topic: varchar("topic", { length: 100 }),
  publishedAt: timestamp("published_at").notNull(),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
  hidden: boolean("hidden").notNull().default(false),
});

export const insertHourlyNewsSchema = createInsertSchema(hourlyNewsTable).omit({ id: true, fetchedAt: true });
export type InsertHourlyNews = z.infer<typeof insertHourlyNewsSchema>;
export type HourlyNews = typeof hourlyNewsTable.$inferSelect;
