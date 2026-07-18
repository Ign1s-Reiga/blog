import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import type { Context } from 'fresh';
import * as schema from '@/lib/db-schema.ts';
import type { State } from '@/utils.ts';

export function getDB(ctx: Context<State>) {
  return drizzle(ctx.state.env.DB, { schema });
}

/**
 * Resolves a `seriesSlug` request field to a series id.
 * Returns `{ id }` on success (null id = detach), or an error Response for
 * unknown slugs / invalid types.
 */
export async function resolveSeriesSlug(
  db: ReturnType<typeof getDB>,
  seriesSlug: unknown,
): Promise<{ id: number | null } | Response> {
  if (seriesSlug === null || seriesSlug === '') return { id: null };
  if (typeof seriesSlug !== 'string') {
    return Response.json({ error: '`seriesSlug` must be a string or null' }, { status: 422 });
  }
  const [row] = await db
    .select({ id: schema.series.id })
    .from(schema.series)
    .where(eq(schema.series.slug, seriesSlug))
    .limit(1);
  if (!row) {
    return Response.json({ error: `Series "${seriesSlug}" does not exist` }, { status: 422 });
  }
  return { id: row.id };
}
