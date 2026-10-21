import { mysqlTable, text, int, varchar, timestamp } from "drizzle-orm/mysql-core";

export const tickerCacheTable = mysqlTable("ticker_cache", {
  id: int("id").primaryKey().autoincrement(),
  cacheKey: varchar("cache_key", { length: 255 }).notNull().unique(),
  data: text("data").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TickerCache = typeof tickerCacheTable.$inferSelect;
