import type { Context } from 'fresh';
import type { State } from '@/utils.ts';

// Compare via SHA-256 digests so the byte-wise loop is constant-time and
// length differences leak nothing.
async function tokensMatch(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [da, db] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b)),
  ]);
  const va = new Uint8Array(da);
  const vb = new Uint8Array(db);
  let diff = 0;
  for (let i = 0; i < va.length; i++) diff |= va[i] ^ vb[i];
  return diff === 0;
}

/**
 * True when the request carries `Authorization: Bearer <ADMIN_TOKEN>`.
 * ADMIN_TOKEN is a Worker secret (`wrangler secret put ADMIN_TOKEN`;
 * `.dev.vars` for local dev). An unset secret denies everything rather than
 * failing open.
 */
export async function isAdmin(ctx: Context<State>): Promise<boolean> {
  const secret = ctx.state.env.ADMIN_TOKEN;
  if (!secret) return false;
  const header = ctx.req.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return false;
  return await tokensMatch(header.slice('Bearer '.length), secret);
}

/** Returns a 401 response to short-circuit with, or null when authorized. */
export async function requireAdmin(ctx: Context<State>): Promise<Response | null> {
  if (await isAdmin(ctx)) return null;
  return Response.json({ error: 'Unauthorized' }, { status: 401, headers: { 'WWW-Authenticate': 'Bearer' } });
}
