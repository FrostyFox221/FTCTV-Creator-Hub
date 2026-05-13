import { pgTable, text, serial, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default("FTCTV.Online"),
  logoUrl: text("logo_url"),
  telegramChannel: text("telegram_channel").notNull().default(""),
  telegramBotToken: text("telegram_bot_token"),
  footerText: text("footer_text").notNull().default("FTC CREATE PRODUCTION 2026. Все права защищены."),
  contactEmail: text("contact_email").notNull().default("ftcmedia@mail.com"),
  autoSyncEnabled: boolean("auto_sync_enabled").notNull().default(true),
  syncIntervalMinutes: integer("sync_interval_minutes").notNull().default(5),
  lastSync: timestamp("last_sync"),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
