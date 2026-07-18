import type { Context } from 'fresh';
import type { State } from '@/utils.ts';

// Post bodies live in R2 under a fixed key convention; D1 holds only the
// queryable metadata (see db-schema.ts). Every R2 access goes through these
// helpers so the convention stays in one place.
function postKey(slug: string): string {
  return `posts/${slug}.md`;
}

export async function getPostContent(ctx: Context<State>, slug: string): Promise<string | null> {
  const obj = await ctx.state.env.BUCKET.get(postKey(slug));
  if (!obj) return null;
  return await obj.text();
}

export async function putPostContent(ctx: Context<State>, slug: string, content: string): Promise<void> {
  await ctx.state.env.BUCKET.put(postKey(slug), content);
}

export function deletePostContent(ctx: Context<State>, slug: string): Promise<void> {
  return ctx.state.env.BUCKET.delete(postKey(slug));
}

export async function movePostContent(ctx: Context<State>, fromSlug: string, toSlug: string): Promise<void> {
  if (fromSlug === toSlug) return;
  const content = await getPostContent(ctx, fromSlug);
  if (content === null) return;
  await putPostContent(ctx, toSlug, content);
  await deletePostContent(ctx, fromSlug);
}
