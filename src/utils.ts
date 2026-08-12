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
 * A `?page=` value as a whole number ≥ 1; anything else is the first page.
 *
 * `Math.max(1, Number(v))` is not enough on its own — `Number('abc')` is NaN
 * and `Math.max` propagates NaN instead of clamping it, which reached D1 as
 * `OFFSET NaN` and rendered the pager as "NaN / 3". `Number(null)` is 0, so a
 * missing param clamps to 1 without a separate default.
 */
export function parsePageParam(value: string | null): number {
  const page = Number(value);
  return Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
}
