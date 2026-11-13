import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { afishaEventsTable } from "@workspace/db/schema";
import { eq, and, gte, like, sql, desc, count } from "drizzle-orm";
import { requireAdmin } from "./admin";

const router = Router();

/* ─── Cities (static list) ─── */
const CITIES: { slug: string; name: string }[] = [
  { slug: "kms", name: "Комсомольск-на-Амуре" },
  { slug: "khabarovsk", name: "Хабаровск" },
  { slug: "vladivostok", name: "Владивосток" },
  { slug: "blagoveshchensk", name: "Благовещенск" },
  { slug: "yuzhno-sakhalinsk", name: "Южно-Сахалинск" },
  { slug: "yakutsk", name: "Якутск" },
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
];

const CATEGORIES = [
  { slug: "concert", name: "Концерты" },
  { slug: "theater", name: "Театр" },
  { slug: "exhibition", name: "Выставки" },
  { slug: "festival", name: "Фестивали" },
  { slug: "cinema", name: "Кино" },
  { slug: "sport", name: "Спорт" },
  { slug: "education", name: "Образование" },
  { slug: "kids", name: "Детям" },
  { slug: "other", name: "Другое" },
];

/* ─── Public: GET /afisha/cities ─── */
router.get("/afisha/cities", (_req: Request, res: Response) => {
  res.json(CITIES);
});

/* ─── Public: GET /afisha/categories ─── */
router.get("/afisha/categories", (_req: Request, res: Response) => {
  res.json(CATEGORIES);
});

/* ─── Public: GET /afisha/events?city=kaliningrad&page=1&page_size=20&category= ─── */
router.get("/afisha/events", async (req: Request, res: Response) => {
  try {
    const city = (req.query.city as string) || "kms";
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.page_size as string) || 20));
    const category = (req.query.category as string) || "";

    const now = new Date();
    const conditions = [
      eq(afishaEventsTable.isPublished, true),
      eq(afishaEventsTable.citySlug, city),
      gte(afishaEventsTable.dateStart, now),
    ];
    if (category) {
      conditions.push(eq(afishaEventsTable.category, category));
    }
    const where = and(...conditions);

    const [totalResult] = await db.select({ total: count() }).from(afishaEventsTable).where(where);
    const total = totalResult?.total ?? 0;

    const offset = (page - 1) * pageSize;
    const events = await db
      .select()
      .from(afishaEventsTable)
      .where(where)
      .orderBy(afishaEventsTable.dateStart)
      .limit(pageSize)
      .offset(offset);

    // Map to a format compatible with the frontend
    const results = events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description || "",
      body_text: e.bodyText || "",
      images: e.imageUrl ? [{ image: e.imageUrl }] : [],
      dates: [
        {
          start: Math.floor(new Date(e.dateStart).getTime() / 1000),
          end: e.dateEnd ? Math.floor(new Date(e.dateEnd).getTime() / 1000) : 0,
        },
      ],
      place: e.placeName ? { id: e.id, title: e.placeName, address: e.placeAddress || "" } : null,
      price: e.price || "",
      categories: e.category ? [e.category] : [],
      site_url: e.url || "",
      age_restriction: e.ageRestriction || null,
      is_free: e.isFree ?? false,
    }));

    const hasNext = offset + pageSize < total;
    res.json({
      results,
      count: total,
      next: hasNext ? `page=${page + 1}` : null,
    });
  } catch (err) {
    req.log?.error?.({ err }, "Afisha events error");
    res.status(500).json({ results: [], count: 0, error: "Internal server error" });
  }
});

/* ─── Admin: GET /afisha/admin/events — all events including unpublished, past ─── */
router.get("/afisha/admin/events", requireAdmin, async (req: Request, res: Response) => {
  try {
    const city = (req.query.city as string) || "";
    const conditions: any[] = [];
    if (city) conditions.push(eq(afishaEventsTable.citySlug, city));

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const events = await db
      .select()
      .from(afishaEventsTable)
      .where(where)
      .orderBy(desc(afishaEventsTable.dateStart));

    res.json(events);
  } catch (err) {
    req.log?.error?.({ err }, "Admin afisha list error");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ─── Admin: POST /afisha/admin/events — create event ─── */
router.post("/afisha/admin/events", requireAdmin, async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const [result] = await db.insert(afishaEventsTable).values({
      title: body.title,
      description: body.description || null,
      bodyText: body.bodyText || null,
      imageUrl: body.imageUrl || null,
      dateStart: new Date(body.dateStart),
      dateEnd: body.dateEnd ? new Date(body.dateEnd) : null,
      placeName: body.placeName || null,
      placeAddress: body.placeAddress || null,
      citySlug: body.citySlug || "kaliningrad",
      category: body.category || "",
      price: body.price || "",
      url: body.url || "",
      isFree: body.isFree || false,
      ageRestriction: body.ageRestriction || null,
      isPublished: body.isPublished !== false,
    });
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    req.log?.error?.({ err }, "Admin afisha create error");
    res.status(500).json({ error: "Failed to create event" });
  }
});

/* ─── Admin: PUT /afisha/admin/events/:id — update event ─── */
router.put("/afisha/admin/events/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body;
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.bodyText !== undefined) updateData.bodyText = body.bodyText;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.dateStart !== undefined) updateData.dateStart = new Date(body.dateStart);
    if (body.dateEnd !== undefined) updateData.dateEnd = body.dateEnd ? new Date(body.dateEnd) : null;
    if (body.placeName !== undefined) updateData.placeName = body.placeName;
    if (body.placeAddress !== undefined) updateData.placeAddress = body.placeAddress;
    if (body.citySlug !== undefined) updateData.citySlug = body.citySlug;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.url !== undefined) updateData.url = body.url;
    if (body.isFree !== undefined) updateData.isFree = body.isFree;
    if (body.ageRestriction !== undefined) updateData.ageRestriction = body.ageRestriction;
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;

    await db.update(afishaEventsTable).set(updateData).where(eq(afishaEventsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log?.error?.({ err }, "Admin afisha update error");
    res.status(500).json({ error: "Failed to update event" });
  }
});

/* ─── Admin: DELETE /afisha/admin/events/:id ─── */
router.delete("/afisha/admin/events/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(afishaEventsTable).where(eq(afishaEventsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log?.error?.({ err }, "Admin afisha delete error");
    res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;
