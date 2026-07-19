import type { Context } from 'fresh';
import type { State } from '@/utils.ts';

// Post bodies live in R2 under a fixed key convention; D1 holds only the
// queryable metadata (see db-schema.ts). Reads go through this helper so the
// key convention stays in one place. Writes are owned by the external CMS.
function postKey(slug: string): string {
  return `posts/${slug}.md`;
}

export async function getPostContent(ctx: Context<State>, slug: string): Promise<string | null> {
  const obj = await ctx.state.env.BUCKET.get(postKey(slug));
  if (!obj) return null;
  return await obj.text();
}
