# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

Inside of project, you'll see the following folders and files:

```text
├── src/
│   ├── assets/
│   ├── components/
│   ├── islands/
│   ├── lib/
│   ├── routes/
│   ├── static/
│   ├── client.ts
│   ├── main.ts
│   └── utils.ts
├── README.md
├── deno.json
├── vite.config.ts
└── wrangler.toml
```

## Commands

All commands are run from the root of the project, from a terminal:

| Command           | Action                       |
| :---------------- | :--------------------------- |
| `deno task dev`   | Starts local Vite dev server |
| `deno task build` | Build your production site   |

## Architecture

This is a **Fresh 2 + Vite** blog, running on Bun and deployed as a static site to GitHub Pages (`blog.reiga7953.net`). The build uses `@m4rocks/fresh-ssg` to pre-render routes into the `out/` directory.

### Entry Points

| File            | Purpose                                                                         |
| --------------- | ------------------------------------------------------------------------------- |
| `src/main.ts`   | Server entry — creates Fresh app, attaches middleware, mounts filesystem routes |
| `src/client.ts` | Client entry — imports global CSS for HMR                                       |

### Routing & Pages

Routes live in `src/routes/` and are picked up automatically by Fresh's filesystem router (configured in `vite.config.ts` via `routeDir`).

- `_app.tsx` — root HTML shell, wraps every page, includes `Header`
- `index.tsx` — home page
- `api/[name].tsx` — example dynamic API route

Use helpers from `src/utils.ts` (`define.page`, `define.handlers`, etc.) for type-safe page/handler definitions. The `State` interface (also in `utils.ts`) carries per-request shared data.

### Islands

Interactive components go in `src/islands/`. Fresh will automatically hydrate these on the client; everything else is server-rendered only.

### Styling

This project uses Tailwind CSS for styling. Global styles are in `src/assets/` and imported in `src/client.ts` for HMR support.
Tailwind is configured in `tailwind.config.js` and included in the build via `vite.config.ts`.

### Markdown Pipeline

`src/lib/markdown.ts` contains a `@ign1s-reiga/marked-presets` pipeline for converting Markdown to HTML. Articles are served from an external base URL configured via the `ARTICLE_SERVED_BASEURL` environment variable (see `.env.development`). The base URL helper is in `src/lib/defines.ts`.

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
