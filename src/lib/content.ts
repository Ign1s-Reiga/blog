import type { Context } from 'fresh';
import type { State } from '@/utils.ts';

// Post bodies and their media live in R2 under a fixed key convention; D1 holds
// only the queryable metadata (see db-schema.ts). Reads go through this file so
// the convention stays in one place.
//
//   posts/<slug>.md               the body
//   posts/<slug>/thumbnail.avif   the card / og:image thumbnail
//   posts/<slug>/<sha256>.avif    an image used in the body
//
// Writes are owned by the external CMS (Ign1s-Reiga/blog-cms-app), which states
// the same layout in src-tauri/src/media_keys.rs. Only the thumbnail is derived
// here: it has a fixed name so its URL follows from the slug alone. Body images
// carry their absolute URL in the Markdown, written by the CMS at publish.
//
// R2_PUBLIC_URL must therefore match the CMS's configured public URL. A
// mismatch breaks images silently, since a missing object 404s rather than
// failing the build.
function postKey(slug: string): string {
  return `posts/${slug}.md`;
}

/** Everything belonging to a post lives under this prefix. */
function mediaPrefix(slug: string): string {
  return `posts/${slug}/`;
}

/**
 * The thumbnail's key. A fixed name rather than a content hash, so the URL is
 * derivable from the slug alone — no lookup, and no thumbnail column in D1.
 */
function thumbnailKey(slug: string): string {
  return `${mediaPrefix(slug)}thumbnail.avif`;
}

/** The bucket's public origin, without a trailing slash. */
function publicBase(ctx: Context<State>): string | undefined {
  const base = (ctx.state.env as { R2_PUBLIC_URL?: string }).R2_PUBLIC_URL;
  return base ? base.replace(/\/+$/, '') : undefined;
}

/**
 * A post's Markdown body, rendered as written.
 *
 * Body images need no rewriting here: the CMS writes their absolute R2 URLs
 * into the Markdown at publish time, since it knows both the slug and the
 * public base. That keeps this side free of the media layout for body images,
 * and avoids a regex that could never have covered raw <img> tags or image
 * syntax inside fenced code blocks.
 */
export async function getPostContent(ctx: Context<State>, slug: string): Promise<string | null> {
  const obj = await ctx.state.env.BUCKET.get(postKey(slug));
  if (!obj) return null;
  return await obj.text();
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
  const base = publicBase(ctx);
  if (base) {
    return `${base}/${thumbnailKey(slug)}`;
  }
  return import.meta.env.DEV ? `https://picsum.photos/seed/${encodeURIComponent(slug)}/800/450` : undefined;
}
