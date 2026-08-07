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

function thumbnailKey(slug: string): string {
  return `posts/${slug}/thumbnail.jpg`;
}

/**
 * Public <img> src for a post's thumbnail, or undefined when there's nothing to
 * show — the card then falls back to its placeholder and og:image is omitted.
 * With R2_PUBLIC_URL set, the object's public URL is returned directly: a
 * missing object 404s and the Thumbnail component's onError fallback shows the
 * placeholder, so no existence check is needed. A per-slug sample image stands
 * in only during local dev so the layout can be previewed; it never ships to
 * production.
 */
export function getPostThumbnail(ctx: Context<State>, slug: string): string | undefined {
  const base = (ctx.state.env as { R2_PUBLIC_URL?: string }).R2_PUBLIC_URL;
  if (base) {
    return `${base.replace(/\/+$/, '')}/${thumbnailKey(slug)}`;
  }
  return import.meta.env.DEV ? `https://picsum.photos/seed/${encodeURIComponent(slug)}/800/450` : undefined;
}
