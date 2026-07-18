import { defineConfig, type PluginOption } from 'vite';
import { fresh } from '@fresh/plugin-vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { dirname, fromFileUrl, join } from '@std/path';

const rootDir = dirname(fromFileUrl(import.meta.url));

// Fresh's server-side plugins apply to every environment whose consumer is
// "server" (see applyToEnvironment in @fresh/plugin-vite), which wrongly
// includes the Cloudflare worker environment. They assume the environment's
// outDir is _fresh/server, so e.g. fresh-route-css-build-ssr crashes reading
// route chunks that the worker env wrote elsewhere. Scope every Fresh plugin
// to Fresh's own client/ssr environments only — the worker env just bundles
// the already-built _fresh/server.js and needs none of them.
function scopeFreshPlugins(plugins: ReturnType<typeof fresh>): PluginOption[] {
  for (const p of plugins.flat()) {
    if (p && typeof p === 'object' && 'applyToEnvironment' in p) {
      const original = p.applyToEnvironment;
      if (typeof original === 'function') {
        const delegate = original as (this: unknown, env: unknown) => boolean;
        p.applyToEnvironment = (env: { name: string }) =>
          (env.name === 'client' || env.name === 'ssr') && delegate.call(p, env);
      }
    } else if (p && typeof p === 'object') {
      p.applyToEnvironment = (env: { name: string }) => env.name === 'client' || env.name === 'ssr';
    }
  }
  // The Deno LSP resolves @fresh/plugin-vite's `vite` types and this file's
  // `vite` import as two distinct copies of the same version; cast to the
  // identity defineConfig expects.
  return plugins as unknown as PluginOption[];
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    scopeFreshPlugins(
      fresh({
        serverEntry: './src/main.ts',
        clientEntry: './src/client.ts',
        islandsDir: './src/islands/',
        routeDir: './src/routes/',
      }),
    ),
    cloudflare(),
    // Fresh's buildApp builds `client` first, then every other environment in
    // parallel — but the Cloudflare worker entry (src/server.ts) imports the
    // artifact Fresh's ssr build writes to disk (_fresh/server.js), so the
    // worker env must build strictly after ssr. This overrides buildApp with a
    // sequential client -> ssr -> workers order (last config hook wins).
    {
      name: 'fresh-cloudflare-build-order',
      config() {
        return {
          builder: {
            async buildApp(builder) {
              const { client, ssr, ...rest } = builder.environments;
              if (client) await builder.build(client);
              if (ssr) await builder.build(ssr);
              for (const env of Object.values(rest)) {
                await builder.build(env);
              }
            },
          },
        };
      },
    },
  ],
  resolve: {
    alias: {
      '@/': join(rootDir, './src/'),
    },
  },
});
