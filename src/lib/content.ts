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
 * Public <img> src for a post's thumbnail. When the bucket's public base URL is
 * configured (R2_PUBLIC_URL) the object's public URL is returned directly — no
 * per-post existence check (R2 head) is needed, since a missing object just
 * 404s and the Thumbnail component falls back to its placeholder on error.
 * Until the base is set, a per-slug sample image stands in so the card layout
 * can be previewed before real thumbnails are uploaded.
 */
export function getPostThumbnail(ctx: Context<State>, slug: string): string {
  const base = (ctx.state.env as { R2_PUBLIC_URL?: string }).R2_PUBLIC_URL;
  if (base) {
    return `${base.replace(/\/+$/, '')}/${thumbnailKey(slug)}`;
  }
  // TODO: temporary sample — remove once real thumbnails land in R2.
  return `https://picsum.photos/seed/${encodeURIComponent(slug)}/800/450`;
}
