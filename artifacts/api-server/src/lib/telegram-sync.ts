import { db } from "@workspace/db";
import { postsTable, settingsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { logger } from "./logger";

const BOT_TOKEN = "8797996336:AAHV9B4xUfQczTKF9TctQJ5lvwOUeFu4r0M";

function removeEmojis(text: string): string {
  return text
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E0}-\u{1F1FF}]/gu,
      ""
    )
    .trim();
}

function extractTitle(text: string): { title: string; content: string } {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { title: "Новость", content: text };
  const first = lines[0].trim();
  const title = first.length > 120 ? first.slice(0, 120) + "..." : first;
  return { title, content: text.trim() };
}

async function getFileUrl(botToken: string, fileId: string): Promise<string | null> {
  try {
    const resp = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
    if (!resp.ok) return null;
    const data = (await resp.json()) as any;
    if (data.ok && data.result?.file_path) {
      return `https://api.telegram.org/file/bot${botToken}/${data.result.file_path}`;
    }
    return null;
  } catch {
    return null;
  }
}

let lastUpdateId = 0;

export async function runTelegramSync(): Promise<{ synced: number; skipped: number; errors: number }> {
  let synced = 0;
  let skipped = 0;
  let errors = 0;

  try {
    const settings = await db.select().from(settingsTable).limit(1);
    const cfg = settings[0];

    if (cfg && !cfg.autoSyncEnabled) {
      return { synced: 0, skipped: 0, errors: 0 };
    }

    const botToken = cfg?.telegramBotToken || BOT_TOKEN;

    const offset = lastUpdateId > 0 ? `&offset=${lastUpdateId + 1}` : "";
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getUpdates?limit=100${offset}&allowed_updates[]=channel_post&allowed_updates[]=message`
    );

    if (!response.ok) {
      logger.warn({ status: response.status }, "Telegram API returned error");
      return { synced: 0, skipped: 0, errors: 1 };
    }

    const data = (await response.json()) as any;
    const updates: any[] = data.result || [];

    for (const update of updates) {
      if (update.update_id > lastUpdateId) {
        lastUpdateId = update.update_id;
      }

      const post = update.channel_post || update.message;
      if (!post) { skipped++; continue; }

      const messageId: number = post.message_id;
      let rawText = (post.text || post.caption || "") as string;
      rawText = removeEmojis(rawText);
      if (!rawText.trim()) { skipped++; continue; }

      // Check duplicate
      const existing = await db
        .select({ id: postsTable.id })
        .from(postsTable)
        .where(eq(postsTable.telegramMessageId, messageId))
        .limit(1);
      if (existing.length > 0) { skipped++; continue; }

      const { title, content } = extractTitle(rawText);
      const images: string[] = [];
      let videoUrl: string | null = null;

      if (post.photo) {
        const largest = post.photo[post.photo.length - 1];
        const url = await getFileUrl(botToken, largest.file_id);
        if (url) images.push(url);
      }
      if (post.video) {
        const url = await getFileUrl(botToken, post.video.file_id);
        if (url) videoUrl = url;
      }

      try {
        await db.insert(postsTable).values({
          title,
          content,
          images,
          videoUrl,
          source: "telegram",
          telegramMessageId: messageId,
          published: true,
        });
        synced++;
      } catch {
        errors++;
      }
    }

    if (synced > 0 || updates.length > 0) {
      await db.update(settingsTable)
        .set({ lastSync: new Date() })
        .where(eq(settingsTable.id, cfg!.id));
    }
  } catch (err) {
    logger.error({ err }, "Telegram auto-sync failed");
    errors++;
  }

  return { synced, skipped, errors };
}

export function startAutoSync(intervalMinutes = 5): void {
  const ms = intervalMinutes * 60 * 1000;

  // Run immediately on startup
  runTelegramSync()
    .then(({ synced }) => {
      if (synced > 0) logger.info({ synced }, "Initial Telegram sync complete");
    })
    .catch((err) => logger.error({ err }, "Initial sync error"));

  setInterval(() => {
    runTelegramSync()
      .then(({ synced }) => {
        if (synced > 0) logger.info({ synced }, "Auto-sync: new posts from Telegram");
      })
      .catch((err) => logger.error({ err }, "Auto-sync error"));
  }, ms);
}
