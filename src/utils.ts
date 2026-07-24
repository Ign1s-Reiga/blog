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
