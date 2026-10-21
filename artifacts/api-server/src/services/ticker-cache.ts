import { db } from "@workspace/db";
import { tickerCacheTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

// TTLs in seconds
const TTL_WEATHER = 10 * 60;   // 10 min
const TTL_RATES = 30 * 60;     // 30 min
const TTL_METALS = 30 * 60;    // 30 min

const TROY_OZ_GRAMS = 31.1035;

async function getCached(key: string, ttlSec: number): Promise<any | null> {
  const rows = await db.select().from(tickerCacheTable).where(eq(tickerCacheTable.cacheKey, key)).limit(1);
  if (!rows.length) return null;
  const row = rows[0]!;
  const age = (Date.now() - new Date(row.updatedAt).getTime()) / 1000;
  if (age > ttlSec) return null;
  try { return JSON.parse(row.data); } catch { return null; }
}

async function setCache(key: string, data: any): Promise<void> {
  const json = JSON.stringify(data);
  const existing = await db.select({ id: tickerCacheTable.id }).from(tickerCacheTable).where(eq(tickerCacheTable.cacheKey, key)).limit(1);
  if (existing.length) {
    await db.update(tickerCacheTable).set({ data: json, updatedAt: new Date() }).where(eq(tickerCacheTable.cacheKey, key));
  } else {
    await db.insert(tickerCacheTable).values({ cacheKey: key, data: json, updatedAt: new Date() });
  }
}

async function getStale(key: string): Promise<any | null> {
  const rows = await db.select().from(tickerCacheTable).where(eq(tickerCacheTable.cacheKey, key)).limit(1);
  if (!rows.length) return null;
  try { return JSON.parse(rows[0]!.data); } catch { return null; }
}

// ---------- Weather ----------
async function fetchWeatherFromSource(city: string): Promise<any> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1&lang=ru`, { signal: ctrl.signal });
    const data: any = await r.json();
    const c = data.current_condition?.[0];
    if (!c) return null;
    return {
      temp: c.temp_C,
      feelsLike: c.FeelsLikeC,
      description: c.lang_ru?.[0]?.value || c.weatherDesc?.[0]?.value || "",
      windSpeed: c.windspeedKmph,
      humidity: c.humidity,
      weatherCode: parseInt(c.weatherCode),
    };
  } finally { clearTimeout(timer); }
}

export async function getWeather(city: string): Promise<any> {
  const key = `weather:${city}`;
  const cached = await getCached(key, TTL_WEATHER);
  if (cached) return cached;
  try {
    const fresh = await fetchWeatherFromSource(city);
    if (fresh) await setCache(key, fresh);
    return fresh;
  } catch (e) {
    logger.warn({ err: e, city }, "Weather fetch failed, using stale");
    return getStale(key);
  }
}

// ---------- Rates ----------
async function fetchRatesFromSource(): Promise<any> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch("https://www.cbr-xml-daily.ru/daily_json.js", { signal: ctrl.signal });
    const data: any = await r.json();
    const pick = ["USD", "EUR", "CNY", "GBP"];
    const usdVal = data.Valute["USD"];
    const usdRate = usdVal.Value / usdVal.Nominal;
    const rates = pick.map((code: string) => {
      const v = data.Valute[code];
      return { code, value: v.Value / v.Nominal, prev: v.Previous / v.Nominal };
    });
    return { rates, usdRate };
  } finally { clearTimeout(timer); }
}

export async function getRates(): Promise<any> {
  const key = "rates:cbr";
  const cached = await getCached(key, TTL_RATES);
  if (cached) return cached;
  try {
    const fresh = await fetchRatesFromSource();
    if (fresh) await setCache(key, fresh);
    return fresh;
  } catch (e) {
    logger.warn({ err: e }, "Rates fetch failed, using stale");
    return getStale(key);
  }
}

// ---------- Metals ----------
async function fetchMetalsFromSource(_usdRate: number): Promise<any> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    // CBR precious metals – prices in RUB per gram
    const today = new Date();
    const fmt = (d: Date) => `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
    const url = `https://www.cbr.ru/scripts/xml_metall.asp?date_req1=${fmt(today)}&date_req2=${fmt(today)}`;
    const r = await fetch(url, { signal: ctrl.signal });
    const text = await r.text();

    // Parse XML: <Record Date="..." Code="1"><Buy>...</Buy><Sell>...</Sell></Record>
    // Code: 1=Gold, 2=Silver, 3=Platinum, 4=Palladium
    const map: Record<string, { name: string; symbol: string }> = {
      "1": { name: "Золото", symbol: "Au" },
      "2": { name: "Серебро", symbol: "Ag" },
      "3": { name: "Платина", symbol: "Pt" },
      "4": { name: "Палладий", symbol: "Pd" },
    };
    const result: any[] = [];
    const recordRe = /<Record[^>]*Code="(\d)"[^>]*>[\s\S]*?<Buy>([\d.,]+)<\/Buy>[\s\S]*?<Sell>([\d.,]+)<\/Sell>[\s\S]*?<\/Record>/g;
    let match;
    while ((match = recordRe.exec(text)) !== null) {
      const meta = map[match[1]!];
      if (meta) {
        const buy = parseFloat(match[2]!.replace(",", "."));
        const sell = parseFloat(match[3]!.replace(",", "."));
        const avg = (buy + sell) / 2;
        result.push({ ...meta, priceRub: avg });
      }
    }
    return result.length > 0 ? result : null;
  } finally { clearTimeout(timer); }
}

export async function getMetals(): Promise<any> {
  const key = "metals:spot";
  const cached = await getCached(key, TTL_METALS);
  if (cached) return cached;
  try {
    // need USD rate
    const ratesData = await getRates();
    const usdRate = ratesData?.usdRate || 90;
    const fresh = await fetchMetalsFromSource(usdRate);
    if (fresh) await setCache(key, fresh);
    return fresh;
  } catch (e) {
    logger.warn({ err: e }, "Metals fetch failed, using stale");
    return getStale(key);
  }
}

// ---------- Combined ----------
export async function getAllTickerData(city: string): Promise<{ weather: any; rates: any; metals: any }> {
  const [weather, ratesData, metals] = await Promise.all([
    getWeather(city).catch(() => null),
    getRates().catch(() => null),
    getMetals().catch(() => null),
  ]);
  return {
    weather,
    rates: ratesData?.rates || null,
    metals,
  };
}
