import { mysqlTable, text, int, boolean, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = mysqlTable("site_settings", {
  id: int("id").primaryKey().autoincrement(),
  siteName: text("site_name").notNull().default("FTCTV.Online"),
  logoUrl: text("logo_url"),
  telegramChannel: text("telegram_channel").notNull().default(""),
  telegramBotToken: text("telegram_bot_token"),
  footerText: text("footer_text").notNull().default("FTC CREATE PRODUCTION 2026. Все права защищены."),
  contactEmail: text("contact_email").notNull().default("ftcmedia@mail.com"),
  autoSyncEnabled: boolean("auto_sync_enabled").notNull().default(true),
  syncIntervalMinutes: int("sync_interval_minutes").notNull().default(5),
  lastSync: timestamp("last_sync"),
  bannerEnabled: boolean("banner_enabled").notNull().default(false),
  bannerTitle: text("banner_title"),
  bannerText: text("banner_text"),
  bannerImageUrl: text("banner_image_url"),
  bannerLink: text("banner_link"),
  // Manual maintenance override
  maintenanceManual: boolean("maintenance_manual").notNull().default(false),
  maintenanceEndsAt: text("maintenance_ends_at"), // ISO string
  maintenanceMessage: text("maintenance_message"),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
