import { Router } from "express";
import { db } from "@workspace/db";
import { postsTable } from "@workspace/db";
import { eq, desc, ilike, or, count } from "drizzle-orm";
import { CreatePostBody, UpdatePostBody, GetPostsQueryParams, GetPostParams, UpdatePostParams, DeletePostParams } from "@workspace/api-zod";

const router = Router();

const ADMIN_TOKEN = "Ftc!_9AdMin#2026_xZq";

function verifyAdmin(req: any): boolean {
  const auth = req.headers["x-admin-token"] || req.headers["authorization"];
  if (!auth) return false;
  const token = typeof auth === "string" && auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  return token === ADMIN_TOKEN;
}

router.get("/posts", async (req, res) => {
  try {
    const rawSearch = req.query.search as string | undefined;
    const query = GetPostsQueryParams.parse({
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      search: rawSearch && rawSearch !== "null" ? rawSearch : null,
    });

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    let whereClause: any = undefined;
    if (query.search) {
      whereClause = or(
        ilike(postsTable.title, `%${query.search}%`),
        ilike(postsTable.content, `%${query.search}%`)
      );
    }

    const [posts, totalResult] = await Promise.all([
      db.select().from(postsTable)
        .where(whereClause)
        .orderBy(desc(postsTable.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(postsTable).where(whereClause),
    ]);

    const total = totalResult[0]?.count ?? 0;

    res.json({
      posts: posts.map(p => ({
        ...p,
        images: p.images ?? [],
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt?.toISOString() ?? null,
      })),
      total: Number(total),
      page,
      limit,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get posts");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/posts/:id", async (req, res) => {
  try {
    const { id } = GetPostParams.parse({ id: Number(req.params.id) });
    const post = await db.select().from(postsTable).where(eq(postsTable.id, id)).limit(1);
    if (!post[0]) return res.status(404).json({ error: "Post not found" });
    const p = post[0];
    res.json({
      ...p,
      images: p.images ?? [],
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt?.toISOString() ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get post");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/posts", async (req, res) => {
  if (!verifyAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
  try {
    const body = CreatePostBody.parse(req.body);
    const [post] = await db.insert(postsTable).values({
      title: body.title,
      content: body.content,
      images: body.images ?? [],
      videoUrl: body.videoUrl ?? null,
      source: "admin",
      published: body.published ?? true,
    }).returning();
    res.status(201).json({
      ...post,
      images: post.images ?? [],
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt?.toISOString() ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create post");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/posts/:id", async (req, res) => {
  if (!verifyAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
  try {
    const { id } = UpdatePostParams.parse({ id: Number(req.params.id) });
    const body = UpdatePostBody.parse(req.body);
    const [post] = await db.update(postsTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(postsTable.id, id))
      .returning();
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json({
      ...post,
      images: post.images ?? [],
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt?.toISOString() ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update post");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/posts/:id", async (req, res) => {
  if (!verifyAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
  try {
    const { id } = DeletePostParams.parse({ id: Number(req.params.id) });
    await db.delete(postsTable).where(eq(postsTable.id, id));
    res.json({ message: "Post deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete post");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
