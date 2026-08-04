CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"images" json DEFAULT '[]'::json,
	"video_url" text,
	"source" text DEFAULT 'admin' NOT NULL,
	"telegram_message_id" integer,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_name" text DEFAULT 'FTCTV.Online' NOT NULL,
	"logo_url" text,
	"telegram_channel" text DEFAULT '' NOT NULL,
	"telegram_bot_token" text,
	"footer_text" text DEFAULT 'FTC CREATE PRODUCTION 2026. Все права защищены.' NOT NULL,
	"contact_email" text DEFAULT 'ftcmedia@mail.com' NOT NULL,
	"auto_sync_enabled" boolean DEFAULT true NOT NULL,
	"sync_interval_minutes" integer DEFAULT 5 NOT NULL,
	"last_sync" timestamp,
	"banner_enabled" boolean DEFAULT false NOT NULL,
	"banner_title" text,
	"banner_text" text,
	"banner_image_url" text,
	"banner_link" text,
	"maintenance_manual" boolean DEFAULT false NOT NULL,
	"maintenance_ends_at" text,
	"maintenance_message" text
);
--> statement-breakpoint
CREATE TABLE "livestream" (
	"id" serial PRIMARY KEY NOT NULL,
	"is_live" boolean DEFAULT false NOT NULL,
	"stream_url" text,
	"stream_type" text,
	"title" text,
	"description" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "schedule" (
	"id" serial PRIMARY KEY NOT NULL,
	"day_of_week" integer NOT NULL,
	"time_slot" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"genre" text,
	"date" text,
	"is_premiere" boolean DEFAULT false NOT NULL,
	"is_live_show" boolean DEFAULT false NOT NULL,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"author_name" text NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "forum_replies" (
	"id" serial PRIMARY KEY NOT NULL,
	"topic_id" integer NOT NULL,
	"author_name" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text DEFAULT 'Общее' NOT NULL,
	"author_name" text NOT NULL,
	"reply_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banners" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"text" text,
	"image_url" text,
	"link" text,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"display_name" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"title" text,
	"link" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
