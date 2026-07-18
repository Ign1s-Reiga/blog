import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './.drizzle',
  schema: './src/lib/db-schema.ts',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: Deno.env.get('CLOUDFLARE_ACCOUNT_ID')!,
    databaseId: Deno.env.get('CLOUDFLARE_DATABASE_ID')!,
    token: Deno.env.get('CLOUDFLARE_D1_TOKEN')!,
  },
});
