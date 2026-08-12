# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

Inside of project, you'll see the following folders and files:

```text
├── .drizzle/               # generated D1 migrations
├── .github/workflows/      # deploy.yml — build + deploy to Cloudflare Workers
├── src/
│   ├── assets/
│   ├── components/
│   ├── islands/
│   ├── lib/
│   ├── routes/
│   ├── client.ts
│   ├── main.ts
│   ├── server.ts
│   └── utils.ts
├── README.md
├── deno.json
├── dev.ts
├── drizzle.config.ts
├── vite.config.ts
└── wrangler.toml
```

## Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                                                     |
| :--------------------- | :------------------------------------------------------------------------- |
| `deno task dev`        | Runs `dev.ts` — build, serve via `wrangler dev`, rebuild on `src/` changes |
| `deno task build`      | Production build (`vite build`) into `dist/blog/`                          |
| `deno task preview`    | Serve the last build with `wrangler dev`                                   |
| `deno task deploy`     | `wrangler deploy` to Cloudflare Workers                                    |
| `deno task db:migrate` | Apply D1 migrations (add `--remote` for production)                        |
| `deno task check`      | Type-check every file (`deno check .`)                                     |
| `deno task lint`       | oxlint (`lint:fix` to autofix)                                             |
| `deno task fmt`        | oxfmt (`fmt:check` to verify)                                              |

Note that `vite dev` is not used — it is unreliable with the Fresh + Cloudflare plugin combination, so `dev.ts` runs a build/watch loop against `wrangler dev` instead.

## Architecture

This is a **Fresh 2 + Vite** blog running on Deno, server-rendered per request and deployed to **Cloudflare Workers** (`blog.reiga7953.net`). `vite build` emits the worker bundle plus a generated `wrangler.json` into `dist/blog/`, and `wrangler deploy` ships it. Post metadata lives in D1, post bodies and thumbnails in R2.

### Entry Points

| File            | Purpose                                                                         |
| --------------- | ------------------------------------------------------------------------------- |
| `src/main.ts`   | Server entry — creates Fresh app, attaches middleware, mounts filesystem routes |
| `src/server.ts` | Worker entry — exports `fetch` from the built Fresh server (`_fresh/server.js`) |
| `src/client.ts` | Client entry — imports global CSS for HMR                                       |

### Cloudflare Workers

`wrangler.toml` declares the worker (`blog`) and its bindings: D1 `DB` (`blog-db`) for metadata and R2 `BUCKET` (`blog-archives`) for post bodies and thumbnails.

- On workerd, Fresh exposes the worker `env` as `ctx.info`. Middleware in `src/main.ts` copies it to `ctx.state.env`, which is how routes reach the bindings (`getDB` in `src/lib/db.ts`, `getPostContent` in `src/lib/content.ts`). AsyncLocalStorage cannot be used for this — `src/server.ts` and the prebuilt Fresh server are separate bundles, so the store comes back empty.
- `vite.config.ts` carries two required workarounds for `@fresh/plugin-vite` ↔ `@cloudflare/vite-plugin`: `scopeFreshPlugins()` keeps Fresh's server plugins out of the worker environment, and the `fresh-cloudflare-build-order` plugin forces a sequential `client → ssr → workers` build. The build fails without either.
- Deploys run from `.github/workflows/deploy.yml` on push to `main`: install → `db:migrate --remote` → build → `wrangler deploy`, using the `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets.
- Schema changes go through drizzle-kit (`drizzle.config.ts`, schema in `src/lib/db-schema.ts`) and land as SQL files in `.drizzle/`.
- Local D1/R2 state defaults to a `.wrangler/` directory beside the built config, which every build wipes; pass `--persist-to` (resolved from the CWD) when local data needs to survive rebuilds.

### Routing & Pages

Routes live in `src/routes/` and are picked up automatically by Fresh's filesystem router (configured in `vite.config.ts` via `routeDir`).

- `_app.tsx` — root HTML shell, wraps every page, includes `Header`
- `_error.tsx` — error/404 page
- `index.tsx`, `about.tsx`, `posts/index.tsx`, `posts/[slug].tsx`, `series/[slug].tsx` — the site's pages; there are no API routes, since writes are owned by an external CMS

Use helpers from `src/utils.ts` (`define.page`, `define.handlers`, etc.) for type-safe page/handler definitions. The `State` interface (also in `utils.ts`) carries per-request shared data: the Workers `env` and the `head` metadata (title, Open Graph) that `_app.tsx` renders.

### Islands

Interactive components go in `src/islands/`. Fresh will automatically hydrate these on the client; everything else is server-rendered only.

### Styling

This project uses Tailwind CSS v4 via `@tailwindcss/vite`, registered in `vite.config.ts`. There is no `tailwind.config.js` — configuration is CSS-first in `src/assets/styles.css`, which imports `tailwindcss`, defines the UI palette as `light-dark()` custom properties (`--ui-*`), and overrides the `--mp-*` variables of `@ign1s-reiga/marked-presets`. That stylesheet is imported by `src/client.ts` for HMR support.

### Markdown Pipeline

Post bodies are stored as Markdown objects in R2 (`posts/<slug>.md`) and read at request time via `getPostContent` in `src/lib/content.ts`; the queryable metadata (title, tags, dates, series membership) lives in D1 (`src/lib/db-schema.ts`). Rendering to HTML uses `renderMarkdown` from `@ign1s-reiga/marked-presets`, imported directly in the post route (`src/routes/posts/[slug].tsx`). Bodies are authored clean by the external CMS, so there is no frontmatter parsing — a leading `# title` in the body is stripped so it doesn't duplicate the title stored in D1.

#### CSS Customization

You can customize the appearance simply by overriding the following CSS variables in your global stylesheet.

```css
/* Example: Global CSS in your Fresh project */
:root {
  /* List: Adjustable CSS Variables */
  --mp-text-primary: #1e1e1e;
  --mp-text-link: #d4d4d4;
  --mp-text-inline-code: #3b82f6;
  --mp-surface-primary: ui-monospace;
  /* Add other variables defined in @ign1s-reiga/marked-presets/index.css */
}
```

### Path Alias

`@/` resolves to `./src/` — use this in all imports instead of relative paths.

### Prohibitions

- Do not run commands like `grep`, `ls`, `find` to find documents. If you need them, I'll provide them to you.
