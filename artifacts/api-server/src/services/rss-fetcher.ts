import RssParser from "rss-parser";
import { db } from "@workspace/db";
import { hourlyNewsTable } from "@workspace/db";
import { desc, gte, sql } from "drizzle-orm";

const parser = new RssParser({ timeout: 8000 });

const RSS_SOURCES = [
  { name: "ТАСС",       url: "https://tass.ru/rss/v2.xml" },
  { name: "РБК",        url: "https://rssexport.rbc.ru/rbcnews/news/30/full.rss" },
  { name: "Интерфакс",  url: "https://www.interfax.ru/rss.asp" },
  { name: "Лента.ру",   url: "https://lenta.ru/rss/news" },
  { name: "РИА Новости", url: "https://ria.ru/export/rss2/archive/index.xml" },
];

const TOPIC_KEYWORDS: Record<string, string[]> = {
  "Политика":    ["политик", "президент", "парламент", "госдума", "правительств", "выборы", "закон", "депутат", "санкции", "мид"],
  "Экономика":   ["экономик", "рубль", "доллар", "нефть", "газ", "инфляция", "бюджет", "банк", "акции", "биржа", "курс"],
  "Общество":    ["общество", "население", "соцпомощь", "пенсион", "образован", "здоровье", "медицин"],
  "Мир":         ["сша", "европ", "нато", "оон", "китай", "украин", "ближний восток", "международн"],
  "Спорт":       ["спорт", "футбол", "хоккей", "олимп", "матч", "чемпион", "сборная", "клуб"],
  "Технологии":  ["технолог", "it", "искусственн", "робот", "цифров", "компьютер", "интернет", "приложен"],
  "Культура":    ["культур", "кино", "фильм", "театр", "музык", "концерт", "выставк", "книг"],
  "Происшествия":["дтп", "авари", "пожар", "взрыв", "чп", "катастроф", "происшеств", "землетряс"],
};

export function detectTopic(title: string, summary?: string | null): string {
  const text = `${title} ${summary || ""}`.toLowerCase();
  let bestTopic = "Разное";
  let bestScore = 0;
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }
  return bestTopic;
}

export async function fetchAndStoreNews(): Promise<number> {
  let totalNew = 0;
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  for (const source of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);
      const items = (feed.items || []).slice(0, 15);

      for (const item of items) {
        if (!item.title || !item.link) continue;
        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
        if (pubDate < oneHourAgo) continue;

        const title = item.title.trim();
        const summary = (item.contentSnippet || item.content || "").slice(0, 500).trim() || null;
        const topic = detectTopic(title, summary);

        try {
          await db.insert(hourlyNewsTable).values({
            title,
            summary,
            sourceUrl: item.link,
            sourceName: source.name,
            topic,
            publishedAt: pubDate,
            hidden: false,
          }).onDuplicateKeyUpdate({ set: { title: sql`title` } });
          totalNew++;
        } catch {
          // duplicate or insert error — skip
        }
      }
    } catch (e) {
      console.warn(`[RSS] Failed to fetch ${source.name}:`, (e as Error).message);
    }
  }
  return totalNew;
}

export async function getHourlyNews(limit = 30) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return db
    .select()
    .from(hourlyNewsTable)
    .where(gte(hourlyNewsTable.publishedAt, oneHourAgo))
    .orderBy(desc(hourlyNewsTable.publishedAt))
    .limit(limit);
}

// Auto-refresh interval (5 minutes)
let intervalId: ReturnType<typeof setInterval> | null = null;

export function startRssFetcher() {
  console.log("[RSS] Starting hourly news fetcher...");
  fetchAndStoreNews().then(n => console.log(`[RSS] Initial fetch: ${n} items`)).catch(console.error);
  intervalId = setInterval(() => {
    fetchAndStoreNews().catch(console.error);
  }, 5 * 60 * 1000);
}

export function stopRssFetcher() {
  if (intervalId) clearInterval(intervalId);
}
