import { and, eq, like, sql } from 'drizzle-orm';
import { define } from '@/utils.ts';
import { isAdmin, requireAdmin } from '@/lib/auth.ts';
import { getDB } from '@/lib/db.ts';
import { posts } from '@/lib/db-schema.ts';
import { putPostContent } from '@/lib/content.ts';

export const handler = define.handlers({
  async GET(ctx) {
    console.log('Handling GET /api/posts');
    const db = getDB(ctx);
    console.log('DB connection established');
    const q = ctx.url.searchParams.get('q')?.trim();
    const page = Math.max(1, Number(ctx.url.searchParams.get('page') ?? '1'));
    const limit = Math.min(100, Math.max(1, Number(ctx.url.searchParams.get('limit') ?? '20')));
    const offset = (page - 1) * limit;

    // Drafts are only listed for authenticated (admin) requests.
    const conditions = [];
    if (q) conditions.push(like(posts.title, `%${q}%`));
    if (!(await isAdmin(ctx))) conditions.push(eq(posts.published, true));
    const where = conditions.length ? and(...conditions) : undefined;

    console.log(db.$client);

    const [rows, [{ count }]] = await Promise.all([
      db.select().from(posts).where(where).limit(limit).offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(where),
    ]);
    console.log('SQL query executed');

    return Response.json({ data: rows, total: count, page, limit });
  },

  async POST(ctx) {
    const denied = await requireAdmin(ctx);
    if (denied) return denied;

    const body = await ctx.req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { slug, title, content, excerpt, tags, published, publishedAt } = body as Record<string, unknown>;

    if (typeof slug !== 'string' || !slug) {
      return Response.json({ error: '`slug` is required' }, { status: 422 });
    }
    if (typeof title !== 'string' || !title) {
      return Response.json({ error: '`title` is required' }, { status: 422 });
    }

    // Insert the metadata row first: a duplicate slug fails fast here without
    // touching the existing post's R2 object. Roll the row back if the R2
    // write fails so the two stores never drift.
    const db = getDB(ctx);
    const [post] = await db
      .insert(posts)
      .values({
        slug,
        title,
        excerpt: typeof excerpt === 'string' ? excerpt : null,
        tags: Array.isArray(tags) ? tags.filter((t): t is string => typeof t === 'string') : [],
        published: published === true,
        publishedAt: publishedAt ? new Date(publishedAt as string) : null,
      })
      .returning();

    try {
      await putPostContent(ctx, slug, typeof content === 'string' ? content : '');
    } catch (err) {
      await db.delete(posts).where(eq(posts.id, post.id));
      throw err;
    }

    return Response.json({ data: post }, { status: 201 });
  },
});
