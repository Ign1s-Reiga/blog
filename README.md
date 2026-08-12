# Reiga-Blog

Personal blog at [blog.reiga7953.net](https://blog.reiga7953.net) — Fresh 2 + Vite on Deno, server-rendered on Cloudflare Workers.

Post metadata lives in D1, bodies and images in R2. Both are written by an external CMS (`Ign1s-Reiga/blog-cms-app`); this repo only reads them.

## Commands

| Command             | Action                                                     |
| :------------------ | :--------------------------------------------------------- |
| `deno task dev`     | Build, serve via `wrangler dev`, rebuild on `src/` changes |
| `deno task build`   | Production build into `dist/blog/`                         |
| `deno task preview` | Serve the last build with `wrangler dev`                   |
| `deno task check`   | Type check (`lint`, `fmt:check` for the rest)              |

## Deploy

Merging a pull request into `main` runs [`deploy.yml`](.github/workflows/deploy.yml): D1 migrations, build, then `wrangler deploy`. A direct push to `main` does not deploy — use the workflow's manual trigger if needed.

Architecture and conventions: [CLAUDE.md](CLAUDE.md).
