import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scheduleTable = pgTable("schedule", {
  id: serial("id").primaryKey(),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Mon, 6=Sun
  timeSlot: text("time_slot").notNull(), // "09:00"
  title: text("title").notNull(),
  description: text("description"),
  genre: text("genre"),
  date: text("date"), // optional specific date e.g. "2026-07-10"
  isPremiere: boolean("is_premiere").notNull().default(false),
  isLiveShow: boolean("is_live_show").notNull().default(false),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertScheduleSchema = createInsertSchema(scheduleTable).omit({ id: true, createdAt: true });
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof scheduleTable.$inferSelect;
