import { eq } from 'drizzle-orm';
import { define } from '@/utils.ts';
import { isAdmin, requireAdmin } from '@/lib/auth.ts';
import { getDB } from '@/lib/db.ts';
import { posts } from '@/lib/db-schema.ts';
import { deletePostContent, getPostContent, movePostContent, putPostContent } from '@/lib/content.ts';

export const handler = define.handlers({
  async GET(ctx) {
    const id = Number(ctx.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return Response.json({ error: 'Invalid id' }, { status: 400 });
    }

    const db = getDB(ctx);
    const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);

    // 404 (not 401) for drafts so unauthenticated callers can't probe which
    // ids exist.
    if (!post || (!post.published && !(await isAdmin(ctx)))) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    const content = await getPostContent(ctx, post.slug);
    return Response.json({ data: { ...post, content } });
  },

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

    const { slug, title, content, excerpt, tags, published, publishedAt } = body as Record<string, unknown>;

    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof slug === 'string' && slug) patch.slug = slug;
    if (typeof title === 'string' && title) patch.title = title;
    if (typeof excerpt === 'string' || excerpt === null) patch.excerpt = excerpt;
    if (Array.isArray(tags)) patch.tags = tags.filter((t): t is string => typeof t === 'string');
    if (typeof published === 'boolean') patch.published = published;
    if (publishedAt !== undefined) patch.publishedAt = publishedAt ? new Date(publishedAt as string) : null;

    const db = getDB(ctx);
    const [existing] = await db.select({ slug: posts.slug }).from(posts).where(eq(posts.id, id)).limit(1);
    if (!existing) return Response.json({ error: 'Not found' }, { status: 404 });

    const [post] = await db.update(posts).set(patch).where(eq(posts.id, id)).returning();

    // Keep the R2 side in step: carry the object over on slug rename, then
    // write the new body (if provided) under the current slug.
    await movePostContent(ctx, existing.slug, post.slug);
    if (typeof content === 'string') await putPostContent(ctx, post.slug, content);

    return Response.json({ data: post });
  },

  async DELETE(ctx) {
    const denied = await requireAdmin(ctx);
    if (denied) return denied;

    const id = Number(ctx.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return Response.json({ error: 'Invalid id' }, { status: 400 });
    }

    const db = getDB(ctx);
    const [deleted] = await db.delete(posts).where(eq(posts.id, id)).returning({ id: posts.id, slug: posts.slug });

    if (!deleted) return Response.json({ error: 'Not found' }, { status: 404 });
    // Row is gone, so the post already 404s; a failed object delete only
    // leaves a harmless orphan in R2 — don't fail the request over it.
    await deletePostContent(ctx, deleted.slug).catch(() => {});
    return new Response(null, { status: 204 });
  },
});
