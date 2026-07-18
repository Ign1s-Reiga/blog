import { and, asc, eq, sql } from 'drizzle-orm';
import { define } from '@/utils.ts';
import { requireAdmin } from '@/lib/auth.ts';
import { getDB } from '@/lib/db.ts';
import { posts, series } from '@/lib/db-schema.ts';

export const handler = define.handlers({
  async GET(ctx) {
    const db = getDB(ctx);
    const rows = await db
      .select({
        id: series.id,
        slug: series.slug,
        title: series.title,
        description: series.description,
        postCount: sql<number>`count(${posts.id})`,
      })
      .from(series)
      .leftJoin(posts, and(eq(posts.seriesId, series.id), eq(posts.published, true)))
      .groupBy(series.id)
      .orderBy(asc(series.slug));

    return Response.json({ data: rows });
  },

  async POST(ctx) {
    const denied = await requireAdmin(ctx);
    if (denied) return denied;

    const body = await ctx.req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { slug, title, description } = body as Record<string, unknown>;
    if (typeof slug !== 'string' || !slug) {
      return Response.json({ error: '`slug` is required' }, { status: 422 });
    }
    if (typeof title !== 'string' || !title) {
      return Response.json({ error: '`title` is required' }, { status: 422 });
    }

    const db = getDB(ctx);
    const [created] = await db
      .insert(series)
      .values({
        slug,
        title,
        description: typeof description === 'string' ? description : null,
      })
      .returning();

    return Response.json({ data: created }, { status: 201 });
  },
});
