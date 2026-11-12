import { mysqlTable, text, int, boolean, datetime, timestamp, varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const afishaEventsTable = mysqlTable("afisha_events", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  bodyText: text("body_text"),
  imageUrl: varchar("image_url", { length: 1000 }),
  dateStart: datetime("date_start").notNull(),
  dateEnd: datetime("date_end"),
  placeName: varchar("place_name", { length: 300 }),
  placeAddress: varchar("place_address", { length: 500 }),
  citySlug: varchar("city_slug", { length: 100 }).notNull().default("kaliningrad"),
  category: varchar("category", { length: 100 }).default(""),
  price: varchar("price", { length: 200 }).default(""),
  url: varchar("url", { length: 1000 }).default(""),
  isFree: boolean("is_free").default(false),
  ageRestriction: varchar("age_restriction", { length: 10 }),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAfishaEventSchema = createInsertSchema(afishaEventsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAfishaEvent = z.infer<typeof insertAfishaEventSchema>;
export type AfishaEvent = typeof afishaEventsTable.$inferSelect;
