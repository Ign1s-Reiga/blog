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
// the same layout in src-tauri/src/media_keys.rs. The two are a contract:
// changing either one without the other silently breaks image loading, since a
// missing object 404s rather than failing the build.
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

/** A target that already points somewhere absolute needs no rewriting. */
function isAbsolute(url: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//') || url.startsWith('/');
}

/**
 * Rewrite the CMS's bare image references to absolute R2 URLs.
 *
 * The CMS publishes body images as a bare `<sha256>.avif`, meaning "relative to
 * this post's media prefix" — it deliberately stores no host, so the bucket can
 * move without rewriting published content. Left alone the browser resolves
 * those against /posts/<slug> and 404s, and `renderMarkdown` accepts no
 * base-URL option, so the rewrite happens on the Markdown before rendering.
 *
 * Only Markdown image syntax with a relative target is touched. Raw <img> tags
 * are left alone, as are image links inside fenced code blocks — rewriting
 * those would need a real parse, and the CMS does not produce them.
 */
function resolveBodyImages(md: string, slug: string, base: string): string {
  const prefix = `${base}/${mediaPrefix(slug)}`;
  return md.replace(
    /(!\[[^\]]*\]\()([^)\s]+)/g,
    (whole: string, head: string, url: string) => (isAbsolute(url) ? whole : `${head}${prefix}${url}`),
  );
}

export async function getPostContent(ctx: Context<State>, slug: string): Promise<string | null> {
  const obj = await ctx.state.env.BUCKET.get(postKey(slug));
  if (!obj) return null;

  const md = await obj.text();
  // Without a public bucket URL there is nowhere to point images at, so the
  // body is served as written (local dev against `wrangler dev`).
  const base = publicBase(ctx);
  return base ? resolveBodyImages(md, slug, base) : md;
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
