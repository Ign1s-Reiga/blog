import { createDefine } from 'fresh';

/** Per-page `<head>` metadata (title, Open Graph, …) set by route handlers. */
export interface HeadMeta {
  /** Page title; rendered as "<title> · <site>" (site name alone when absent). */
  title?: string;
  description?: string;
  /** Absolute URL of the preview image (og:image). */
  image?: string;
  type?: 'website' | 'article';
  /** ISO 8601 — article:published_time. */
  publishedTime?: string;
  /** ISO 8601 — article:modified_time. */
  modifiedTime?: string;
  /** article:tag values. */
  tags?: string[];
}

export interface State {
  shared: string;
  env: Cloudflare.Env;
  head?: HeadMeta;
}

export const define = createDefine<State>();

/**
 * A `?page=` value as a whole number ≥ 1, small enough to page with.
 *
 * `Math.max(1, Number(v))` is not enough on its own — `Number('abc')` is NaN
 * and `Math.max` propagates NaN instead of clamping it, which reached D1 as
 * `OFFSET NaN` and rendered the pager as "NaN / 3". `Number(null)` is 0, so a
 * missing param clamps to 1 without a separate default.
 *
 * Rejecting non-finite input is not enough either: `1e308` is finite and
 * survives it, but `(page - 1) * pageSize` then overflows to Infinity and D1
 * rejects the bind with a 500. `pageSize` is taken here so the result is capped
 * where that product is still an exact integer. Anything capped is far past the
 * end of a real listing, so the caller's bounds check redirects it to the last
 * page like any other overshoot.
 */
export function parsePageParam(value: string | null, pageSize: number): number {
  const page = Number(value);
  if (!Number.isFinite(page)) return 1;
  return Math.min(Math.max(1, Math.floor(page)), Math.floor(Number.MAX_SAFE_INTEGER / pageSize));
}

/**
 * Redirect to another page of the same listing, keeping the rest of the query.
 *
 * Temporary, not permanent: which page is the last one moves as posts are
 * published. Page 1 drops the param entirely so the first page has one URL
 * rather than two.
 */
export function redirectToPage(url: URL, page: number): Response {
  const target = new URL(url);
  if (page > 1) target.searchParams.set('page', String(page));
  else target.searchParams.delete('page');
  return new Response(null, { status: 302, headers: { location: `${target.pathname}${target.search}` } });
}
