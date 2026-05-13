import { Router } from "express";
import { db } from "@workspace/db";
import { postsTable, settingsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { SyncTelegramBody } from "@workspace/api-zod";

const router = Router();

const ADMIN_TOKEN = "Ftc!_9AdMin#2026_xZq";
const BOT_TOKEN = "8797996336:AAHV9B4xUfQczTKF9TctQJ5lvwOUeFu4r0M";

function removeEmojis(text: string): string {
  return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E0}-\u{1F1FF}\u{231A}-\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2614}-\u{2615}\u{2648}-\u{2653}\u{267F}\u{2693}\u{26A1}\u{26AA}-\u{26AB}\u{26BD}-\u{26BE}\u{26C4}-\u{26C5}\u{26CE}\u{26D4}\u{26EA}\u{26F2}-\u{26F3}\u{26F5}\u{26FA}\u{26FD}\u{2702}\u{2705}\u{2708}-\u{270D}\u{270F}\u{2712}\u{2714}\u{2716}\u{271D}\u{2721}\u{2728}\u{2733}-\u{2734}\u{2744}\u{2747}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2763}-\u{2764}\u{2795}-\u{2797}\u{27A1}\u{27B0}\u{27BF}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}]/gu, "").trim();
}

function extractTitleFromText(text: string): { title: string; content: string } {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { title: "Новость", content: text };
  const firstLine = lines[0].trim();
  const title = firstLine.length > 120 ? firstLine.slice(0, 120) + "..." : firstLine;
  const content = lines.join("\n").trim();
  return { title, content };
}

async function getFileUrl(botToken: string, fileId: string): Promise<string | null> {
  try {
    const resp = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
    if (!resp.ok) return null;
    const data = await resp.json() as any;
    if (data.ok && data.result?.file_path) {
      return `https://api.telegram.org/file/bot${botToken}/${data.result.file_path}`;
    }
    return null;
  } catch {
    return null;
  }
}

async function processUpdate(update: any, botToken: string): Promise<{
  title: string;
  content: string;
  images: string[];
  videoUrl: string | null;
  telegramMessageId: number;
} | null> {
  const post = update.channel_post || update.message;
  if (!post) return null;

  const messageId = post.message_id as number;
  let rawText = ((post.text || post.caption || "") as string);
  rawText = removeEmojis(rawText);
  if (!rawText.trim()) return null;

  const { title, content } = extractTitleFromText(rawText);
  const images: string[] = [];
  let videoUrl: string | null = null;

  // Handle photo (mediaGroup = multiple photos)
  if (post.photo) {
    const largestPhoto = post.photo[post.photo.length - 1];
    const url = await getFileUrl(botToken, largestPhoto.file_id);
    if (url) images.push(url);
  }

  // Handle video
  if (post.video) {
    const url = await getFileUrl(botToken, post.video.file_id);
    if (url) videoUrl = url;
  }

  return { title, content, images, videoUrl, telegramMessageId: messageId };
}

router.post("/telegram/sync", async (req, res) => {
  try {
    const body = SyncTelegramBody.parse(req.body);
    if (body.adminToken !== ADMIN_TOKEN) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const settings = await db.select().from(settingsTable).limit(1);
    const cfg = settings[0];
    const botToken = cfg?.telegramBotToken || BOT_TOKEN;

    let synced = 0;
    let skipped = 0;
    let errors = 0;

    try {
      const limit = body.limit ?? 50;
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/getUpdates?limit=${limit}&allowed_updates[]=channel_post&allowed_updates[]=message`
      );

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.status}`);
      }

      const data = await response.json() as any;
      const updates = data.result || [];

      for (const update of updates) {
        try {
          const processed = await processUpdate(update, botToken);
          if (!processed) { skipped++; continue; }

          // Check if already synced
          const existing = await db.select({ id: postsTable.id })
            .from(postsTable)
            .where(eq(postsTable.telegramMessageId, processed.telegramMessageId))
            .limit(1);

          if (existing.length > 0) { skipped++; continue; }

          await db.insert(postsTable).values({
            title: processed.title,
            content: processed.content,
            images: processed.images,
            videoUrl: processed.videoUrl,
            source: "telegram",
            telegramMessageId: processed.telegramMessageId,
            published: true,
          });
          synced++;
        } catch {
          errors++;
        }
      }

      // Update last sync time
      if (cfg) {
        await db.update(settingsTable)
          .set({ lastSync: new Date() })
          .where(eq(settingsTable.id, cfg.id));
      }
    } catch (e: any) {
      req.log.error({ err: e }, "Telegram sync failed");
      return res.json({
        synced: 0,
        skipped: 0,
        errors: 1,
        message: `Sync failed: ${e.message}`,
      });
    }

    res.json({
      synced,
      skipped,
      errors,
      message: `Synced ${synced} posts, skipped ${skipped}`,
    });
  } catch (err) {
    req.log.error({ err }, "Sync error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/telegram/status", async (req, res) => {
  try {
    const settings = await db.select().from(settingsTable).limit(1);
    const cfg = settings[0];

    const [totalResult] = await db.select({ value: count() }).from(postsTable);
    const total = Number(totalResult?.value ?? 0);

    res.json({
      lastSync: cfg?.lastSync?.toISOString() ?? null,
      totalPosts: total,
      telegramChannel: cfg?.telegramChannel ?? "",
      autoSyncEnabled: cfg?.autoSyncEnabled ?? true,
    });
  } catch (err) {
    req.log.error({ err }, "Status error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
