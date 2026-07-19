import { drizzle } from 'drizzle-orm/d1';
import type { Context } from 'fresh';
import * as schema from '@/lib/db-schema.ts';
import type { State } from '@/utils.ts';

export function getDB(ctx: Context<State>) {
  return drizzle(ctx.state.env.DB, { schema });
}
