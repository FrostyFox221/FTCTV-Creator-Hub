import { Bot, type Context } from "node-telegram-bot-api";
import os from "os";

const BOT_TOKEN = process.env["TELEGRAM_CONSOLE_BOT_TOKEN"] || "";

let bot: Bot | null = null;
const subscribedChats = new Set<number>();
let totalRequests = 0;
let startTime = Date.now();

// Rate-limit: batch messages to avoid Telegram flood
const messageQueue: string[] = [];
let flushTimer: NodeJS.Timeout | null = null;
const FLUSH_INTERVAL = 1000; // 1 second batching
const MAX_MSG_LENGTH = 4000;

function flushQueue() {
  if (messageQueue.length === 0 || !bot || subscribedChats.size === 0) return;

  // Combine queued messages into batches
  let batch = "";
  const batches: string[] = [];

  for (const msg of messageQueue) {
    if (batch.length + msg.length + 2 > MAX_MSG_LENGTH) {
      if (batch) batches.push(batch);
      batch = msg;
    } else {
      batch += (batch ? "\n\n" : "") + msg;
    }
  }
  if (batch) batches.push(batch);
  messageQueue.length = 0;

  for (const text of batches) {
    for (const chatId of subscribedChats) {
      bot.api.sendMessage({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
      }).catch(() => {});
    }
  }
}

function scheduleFlush() {
  if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flushQueue();
    }, FLUSH_INTERVAL);
  }
}

// Category detection
interface ActivityEvent {
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  ip: string;
  userAgent: string;
  body?: Record<string, unknown>;
  timestamp: Date;
}

function categorize(ev: ActivityEvent): { icon: string; label: string } {
  const p = ev.path;
  const m = ev.method;

  // Errors
  if (ev.statusCode >= 500) return { icon: "🔴", label: "SERVER ERROR" };
  if (ev.statusCode === 401) return { icon: "🚫", label: "UNAUTHORIZED" };
  if (ev.statusCode === 403) return { icon: "⛔", label: "FORBIDDEN" };
  if (ev.statusCode === 404) return { icon: "❓", label: "NOT FOUND" };

  // Admin actions
  if (p.includes("/admin/login")) return { icon: "🔑", label: "ADMIN LOGIN" };
  if (p.includes("/admin")) return { icon: "👑", label: "ADMIN" };

  // Uploads
  if (p.includes("/upload")) return { icon: "🖼", label: "UPLOAD" };

  // Auth
  if (p.includes("/auth")) return { icon: "🔐", label: "AUTH" };

  // Content mutations
  if (m === "POST" && p.includes("/posts")) return { icon: "📝", label: "NEW POST" };
  if (m === "PUT" && p.includes("/posts")) return { icon: "✏️", label: "EDIT POST" };
  if (m === "DELETE" && p.includes("/posts")) return { icon: "🗑", label: "DELETE POST" };

  if (p.includes("/comments")) {
    if (m === "POST") return { icon: "💬", label: "NEW COMMENT" };
    if (m === "DELETE") return { icon: "🗑", label: "DELETE COMMENT" };
  }

  if (p.includes("/reactions")) return { icon: "❤️", label: "REACTION" };

  if (p.includes("/gallery")) {
    if (m === "POST") return { icon: "🖼", label: "GALLERY CREATE" };
    if (m === "PUT") return { icon: "🖼", label: "GALLERY UPDATE" };
    if (m === "DELETE") return { icon: "🗑", label: "GALLERY DELETE" };
    return { icon: "🖼", label: "GALLERY" };
  }

  if (p.includes("/schedule")) {
    if (m !== "GET") return { icon: "📅", label: "SCHEDULE UPDATE" };
    return { icon: "📅", label: "SCHEDULE" };
  }

  if (p.includes("/settings")) return { icon: "⚙️", label: "SETTINGS" };

  if (p.includes("/banners")) {
    if (m !== "GET") return { icon: "🏷", label: "BANNER UPDATE" };
    return { icon: "🏷", label: "BANNER" };
  }

  if (p.includes("/livestream")) return { icon: "📡", label: "LIVESTREAM" };
  if (p.includes("/stories")) return { icon: "📖", label: "STORIES" };
  if (p.includes("/telegram")) return { icon: "✈️", label: "TELEGRAM SYNC" };
  if (p.includes("/maintenance")) return { icon: "🔧", label: "MAINTENANCE" };
  if (p.includes("/forum")) return { icon: "🗣", label: "FORUM" };
  if (p.includes("/articles")) return { icon: "📰", label: "ARTICLES" };
  if (p.includes("/video")) return { icon: "🎬", label: "VIDEO" };
  if (p.includes("/ticker")) return { icon: "📢", label: "TICKER" };
  if (p.includes("/hourly-news")) return { icon: "📰", label: "HOURLY NEWS" };
  if (p.includes("/profile")) return { icon: "👤", label: "PROFILE" };

  // Generic reads
  if (m === "GET") return { icon: "👁", label: "VIEW" };

  return { icon: "📌", label: m };
}

function formatTime(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function statusEmoji(code: number): string {
  if (code < 300) return "✅";
  if (code < 400) return "↩️";
  if (code < 500) return "⚠️";
  return "💥";
}

export function notifyActivity(ev: ActivityEvent) {
  totalRequests++;
  if (!bot || subscribedChats.size === 0) return;

  const { icon, label } = categorize(ev);
  const ts = formatTime(ev.timestamp);
  const se = statusEmoji(ev.statusCode);

  let msg = `${icon} <b>${label}</b>\n`;
  msg += `⏱ ${ts}\n`;
  msg += `${se} <code>${ev.method} ${ev.path}</code> → <b>${ev.statusCode}</b> (${ev.durationMs}ms)\n`;
  msg += `🌐 ${ev.ip}`;

  if (ev.userAgent) {
    // Shorten user-agent
    const ua = ev.userAgent.length > 60 ? ev.userAgent.substring(0, 57) + "..." : ev.userAgent;
    msg += `\n👤 <i>${ua}</i>`;
  }

  messageQueue.push(msg);
  scheduleFlush();
}

export function incrementRequests() {
  totalRequests++;
}

export function startTelegramConsole() {
  if (!BOT_TOKEN) {
    console.warn("[TG Console] TELEGRAM_CONSOLE_BOT_TOKEN not set, skipping");
    return;
  }

  try {
    bot = new Bot(BOT_TOKEN);
    startTime = Date.now();
    console.log("[TG Console] Bot starting...");

    // /start command
    bot.command("start", async (ctx: Context) => {
      const chatId = ctx.chatId;
      if (!chatId) return;
      subscribedChats.add(chatId);
      await ctx.reply(
        "🟢 <b>FTCTV Console подключена</b>\n\n" +
        "Вы будете получать уведомления о всех действиях на сайте в реальном времени.\n\n" +
        "Команды:\n" +
        "/status — статус сервера\n" +
        "/stop — отключить уведомления\n" +
        "/start — включить уведомления",
        { parse_mode: "HTML" }
      ).catch(() => {});
    });

    // /status command
    bot.command("status", async (ctx: Context) => {
      const chatId = ctx.chatId;
      if (!chatId) return;

      const uptimeSec = Math.floor((Date.now() - startTime) / 1000);
      const hours = Math.floor(uptimeSec / 3600);
      const mins = Math.floor((uptimeSec % 3600) / 60);
      const secs = uptimeSec % 60;

      const memUsage = process.memoryUsage();
      const memMb = (memUsage.rss / 1024 / 1024).toFixed(1);
      const heapMb = (memUsage.heapUsed / 1024 / 1024).toFixed(1);

      const cpus = os.cpus();
      const loadAvg = os.loadavg();

      let text = "📊 <b>FTCTV Server Status</b>\n\n";
      text += `⏱ Uptime: <b>${hours}ч ${mins}м ${secs}с</b>\n`;
      text += `📈 Запросов обработано: <b>${totalRequests}</b>\n`;
      text += `💾 RAM: <b>${memMb} MB</b> (heap: ${heapMb} MB)\n`;
      text += `🖥 CPU: ${cpus.length} cores\n`;
      text += `📉 Load: ${loadAvg.map(l => l.toFixed(2)).join(" / ")}\n`;
      text += `👥 Подписчиков: <b>${subscribedChats.size}</b>\n`;
      text += `🕐 Время: ${formatTime(new Date())}`;

      await ctx.reply(text, { parse_mode: "HTML" }).catch(() => {});
    });

    // /stop command
    bot.command("stop", async (ctx: Context) => {
      const chatId = ctx.chatId;
      if (!chatId) return;
      subscribedChats.delete(chatId);
      await ctx.reply(
        "🔴 <b>Уведомления отключены</b>\n\nИспользуйте /start чтобы снова подключиться.",
        { parse_mode: "HTML" }
      ).catch(() => {});
    });

    // Start polling in background
    bot.startPolling().catch((err) => {
      console.error("[TG Console] Polling error:", err);
    });

    console.log("[TG Console] Bot started successfully");
  } catch (err) {
    console.error("[TG Console] Failed to start bot:", err);
  }
}
