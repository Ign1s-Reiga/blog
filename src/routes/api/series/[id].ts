import { eq } from 'drizzle-orm';
import { define } from '@/utils.ts';
import { requireAdmin } from '@/lib/auth.ts';
import { getDB } from '@/lib/db.ts';
import { posts, series } from '@/lib/db-schema.ts';

export const handler = define.handlers({
  async PUT(ctx) {
    const denied = await requireAdmin(ctx);
    if (denied) return denied;

    const id = Number(ctx.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return Response.json({ error: 'Invalid id' }, { status: 400 });
    }

    const body = await ctx.req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { slug, title, description } = body as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    if (typeof slug === 'string' && slug) patch.slug = slug;
    if (typeof title === 'string' && title) patch.title = title;
    if (typeof description === 'string' || description === null) patch.description = description;

    const db = getDB(ctx);
    const [updated] = await db.update(series).set(patch).where(eq(series.id, id)).returning();

    if (!updated) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json({ data: updated });
  },

  async DELETE(ctx) {
    const denied = await requireAdmin(ctx);
    if (denied) return denied;

    const id = Number(ctx.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return Response.json({ error: 'Invalid id' }, { status: 400 });
    }

    const db = getDB(ctx);
    // Detach members first; posts survive the series they belonged to.
    await db.update(posts).set({ seriesId: null, seriesOrder: null }).where(eq(posts.seriesId, id));
    const [deleted] = await db.delete(series).where(eq(series.id, id)).returning({ id: series.id });

    if (!deleted) return Response.json({ error: 'Not found' }, { status: 404 });
    return new Response(null, { status: 204 });
  },
});
