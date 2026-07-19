import { and, asc, eq, like, sql } from 'drizzle-orm';
import { getDB } from '@/lib/db.ts';
import { posts, series } from '@/lib/db-schema.ts';
import type { Post, Series } from '@/lib/db-schema.ts';

type DB = ReturnType<typeof getDB>;

export interface ListPostsOptions {
  /** Case-sensitive title substring filter; skipped when empty/undefined. */
  q?: string;
  /** Gate drafts. Callers decide based on auth (public listings pass `true`). */
  publishedOnly: boolean;
  limit: number;
  offset: number;
}

export interface ListPostsResult {
  rows: Post[];
  total: number;
}

/**
 * Paginated post listing shared by `GET /api/posts` and the `/posts` page.
 * The caller owns page/limit → offset math and response shaping; this only
 * runs the filtered query and its matching count.
 */
export async function listPosts(
  db: DB,
  { q, publishedOnly, limit, offset }: ListPostsOptions,
): Promise<ListPostsResult> {
  const conditions = [];
  if (q) conditions.push(like(posts.title, `%${q}%`));
  if (publishedOnly) conditions.push(eq(posts.published, true));
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, [{ count }]] = await Promise.all([
    db.select().from(posts).where(where).limit(limit).offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(where),
  ]);

  return { rows, total: count };
}

export async function getPostBySlug(db: DB, slug: string): Promise<Post | null> {
  const [post] = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  return post ?? null;
}

export interface SeriesLink {
  slug: string;
  title: string;
}

export interface SeriesNav {
  slug: string;
  title: string;
  part: number;
  total: number;
  prev: SeriesLink | null;
  next: SeriesLink | null;
}

/**
 * Position of `post` among the published parts of its series, with prev/next
 * links. Returns undefined when the post isn't in a series, the series row is
 * missing, or the post isn't among its published members.
 */
export async function getSeriesNav(db: DB, post: Post): Promise<SeriesNav | undefined> {
  if (post.seriesId === null) return undefined;

  const [s] = await db.select().from(series).where(eq(series.id, post.seriesId)).limit(1);
  if (!s) return undefined;

  const members = await db
    .select({ slug: posts.slug, title: posts.title })
    .from(posts)
    .where(and(eq(posts.seriesId, s.id), eq(posts.published, true)))
    .orderBy(asc(posts.seriesOrder));
  const index = members.findIndex((m) => m.slug === post.slug);
  if (index === -1) return undefined;

  return {
    slug: s.slug,
    title: s.title,
    part: index + 1,
    total: members.length,
    prev: members[index - 1] ?? null,
    next: members[index + 1] ?? null,
  };
}

export async function getSeriesBySlug(db: DB, slug: string): Promise<Series | null> {
  const [s] = await db.select().from(series).where(eq(series.slug, slug)).limit(1);
  return s ?? null;
}

export interface SeriesMember {
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: Date | null;
}

/** Published parts of a series, in reading order (by `seriesOrder`). */
export async function getSeriesMembers(db: DB, seriesId: number): Promise<SeriesMember[]> {
  const members = await db
    .select({
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .where(and(eq(posts.seriesId, seriesId), eq(posts.published, true)))
    .orderBy(asc(posts.seriesOrder));
  return members;
}
