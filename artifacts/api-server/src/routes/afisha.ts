import { Router, type Request, type Response } from "express";

const router = Router();

/**
 * KudaGo proxy — events and locations for the Afisha section.
 * Caches city list for 24h, events for 10 min.
 */

let citiesCache: { data: any[]; ts: number } | null = null;
const CITIES_TTL = 86400000; // 24h
const eventsCache = new Map<string, { data: any; ts: number }>();
const EVENTS_TTL = 600000; // 10min

// Extended city list beyond KudaGo defaults
const EXTRA_CITIES: { slug: string; name: string }[] = [
  { slug: "kaliningrad", name: "Калининград" },
  { slug: "spb", name: "Санкт-Петербург" },
  { slug: "msk", name: "Москва" },
  { slug: "nnov", name: "Нижний Новгород" },
  { slug: "ekb", name: "Екатеринбург" },
  { slug: "nsk", name: "Новосибирск" },
  { slug: "kzn", name: "Казань" },
  { slug: "smr", name: "Самара" },
  { slug: "krd", name: "Краснодар" },
  { slug: "sochi", name: "Сочи" },
  { slug: "rostov", name: "Ростов-на-Дону" },
  { slug: "ufa", name: "Уфа" },
  { slug: "krasnoyarsk", name: "Красноярск" },
  { slug: "perm", name: "Пермь" },
  { slug: "voronezh", name: "Воронеж" },
  { slug: "volgograd", name: "Волгоград" },
  { slug: "chelyabinsk", name: "Челябинск" },
  { slug: "omsk", name: "Омск" },
  { slug: "tomsk", name: "Томск" },
  { slug: "tyumen", name: "Тюмень" },
  { slug: "irkutsk", name: "Иркутск" },
  { slug: "vladivostok", name: "Владивосток" },
  { slug: "khabarovsk", name: "Хабаровск" },
  { slug: "barnaul", name: "Барнаул" },
  { slug: "saratov", name: "Саратов" },
  { slug: "yaroslavl", name: "Ярославль" },
  { slug: "tula", name: "Тула" },
  { slug: "ryazan", name: "Рязань" },
  { slug: "izhevsk", name: "Ижевск" },
  { slug: "kaluga", name: "Калуга" },
  { slug: "surgut", name: "Сургут" },
  { slug: "novorossiysk", name: "Новороссийск" },
  { slug: "murmansk", name: "Мурманск" },
  { slug: "arkhangelsk", name: "Архангельск" },
  { slug: "petrozavodsk", name: "Петрозаводск" },
  { slug: "syktyvkar", name: "Сыктывкар" },
  { slug: "chita", name: "Чита" },
  { slug: "yakutsk", name: "Якутск" },
  { slug: "yuzhno-sakhalinsk", name: "Южно-Сахалинск" },
  { slug: "petropavlovsk", name: "Петропавловск-Камчатский" },
  { slug: "magadan", name: "Магадан" },
  { slug: "blagoveshchensk", name: "Благовещенск" },
  { slug: "orenburg", name: "Оренбург" },
  { slug: "penza", name: "Пенза" },
  { slug: "lipetsk", name: "Липецк" },
  { slug: "bryansk", name: "Брянск" },
  { slug: "vladimir", name: "Владимир" },
  { slug: "smolensk", name: "Смоленск" },
  { slug: "tver", name: "Тверь" },
  { slug: "kursk", name: "Курск" },
  { slug: "belgorod", name: "Белгород" },
  { slug: "stavropol", name: "Ставрополь" },
  { slug: "kemerovo", name: "Кемерово" },
  { slug: "novokuznetsk", name: "Новокузнецк" },
  { slug: "naberezhnye-chelny", name: "Набережные Челны" },
  { slug: "astrakhan", name: "Астрахань" },
  { slug: "kirov", name: "Киров" },
  { slug: "ulyanovsk", name: "Ульяновск" },
  { slug: "cheboksary", name: "Чебоксары" },
  { slug: "magnitogorsk", name: "Магнитогорск" },
];

/** GET /afisha/cities */
router.get("/afisha/cities", async (_req: Request, res: Response) => {
  try {
    if (citiesCache && Date.now() - citiesCache.ts < CITIES_TTL) {
      res.json(citiesCache.data);
      return;
    }
    const resp = await fetch("https://kudago.com/public-api/v1.4/locations/?lang=ru&fields=slug,name&order_by=name", { headers: { "User-Agent": "FTCTV/1.0" } });
    if (!resp.ok) {
      // fallback to built-in list
      res.json(EXTRA_CITIES);
      return;
    }
    const json = await resp.json();
    const kudaCities: { slug: string; name: string }[] = json.results || json || [];

    // Merge: KudaGo cities + extras not already present
    const slugSet = new Set(kudaCities.map((c: any) => c.slug));
    const merged = [...kudaCities];
    for (const ec of EXTRA_CITIES) {
      if (!slugSet.has(ec.slug)) merged.push(ec);
    }
    merged.sort((a, b) => a.name.localeCompare(b.name, "ru"));

    citiesCache = { data: merged, ts: Date.now() };
    res.json(merged);
  } catch {
    res.json(EXTRA_CITIES);
  }
});

/** GET /afisha/events?city=khabarovsk&page=1&page_size=20&category= */
router.get("/afisha/events", async (req: Request, res: Response) => {
  const city = (req.query.city as string) || "khabarovsk";
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.page_size as string) || 20;
  const category = (req.query.category as string) || "";

  const cacheKey = `${city}:${page}:${pageSize}:${category}`;
  const cached = eventsCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < EVENTS_TTL) {
    res.json(cached.data);
    return;
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    let url = `https://kudago.com/public-api/v1.4/events/?lang=ru&location=${encodeURIComponent(city)}&actual_since=${now}&page=${page}&page_size=${pageSize}&fields=id,title,description,body_text,dates,images,place,price,site_url,categories,short_title,age_restriction&expand=place&order_by=-dates&text_format=text`;
    if (category) url += `&categories=${encodeURIComponent(category)}`;

    const resp = await fetch(url, { headers: { "User-Agent": "FTCTV/1.0" } });
    if (!resp.ok) {
      res.json({ results: [], count: 0, notice: "Сервис событий временно недоступен. Попробуйте позже." });
      return;
    }
    const data = await resp.json();
    eventsCache.set(cacheKey, { data, ts: Date.now() });
    res.json(data);
  } catch {
    res.json({ results: [], count: 0, notice: "Сервис событий временно недоступен. Попробуйте позже." });
  }
});

/** GET /afisha/categories */
router.get("/afisha/categories", async (_req: Request, res: Response) => {
  try {
    const resp = await fetch("https://kudago.com/public-api/v1.4/event-categories/?lang=ru", { headers: { "User-Agent": "FTCTV/1.0" } });
    if (!resp.ok) { res.json([]); return; }
    const data = await resp.json();
    res.json(data);
  } catch {
    res.json([]);
  }
});

export default router;
