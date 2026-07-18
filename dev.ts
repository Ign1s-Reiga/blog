// Development loop: `vite dev` is unreliable with the fresh + cloudflare
// plugin combination, so instead this watches src/ and re-runs `vite build`
// on change while `wrangler dev` serves the built worker from dist/ —
// wrangler notices the rewritten artifact and reloads it automatically.
// Run with: deno task dev

const DEBOUNCE_MS = 400;

async function runBuild(): Promise<boolean> {
  const started = Date.now();
  console.log('[dev] building…');
  const result = await new Deno.Command('deno', {
    args: ['task', 'build'],
    stdout: 'inherit',
    stderr: 'inherit',
  }).output();
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    result.success
      ? `[dev] build done in ${secs}s`
      : `[dev] build FAILED after ${secs}s — fix the error, saving retriggers`,
  );
  return result.success;
}

// Serialize builds: changes arriving mid-build coalesce into one follow-up run.
let building = false;
let dirty = false;
async function rebuild() {
  if (building) {
    dirty = true;
    return;
  }
  building = true;
  try {
    do {
      dirty = false;
      await runBuild();
    } while (dirty);
  } finally {
    building = false;
  }
}

// Fresh artifact first, then hand it to wrangler.
await runBuild();

const wrangler = new Deno.Command('deno', {
  args: ['task', 'preview'],
  stdin: 'inherit',
  stdout: 'inherit',
  stderr: 'inherit',
}).spawn();

wrangler.status.then((status) => {
  console.log(`[dev] wrangler dev exited (code ${status.code})`);
  Deno.exit(status.code);
});

Deno.addSignalListener('SIGINT', () => {
  try {
    wrangler.kill();
  } catch {
    // already gone
  }
  Deno.exit(0);
});

console.log('[dev] watching src/ — edits trigger a rebuild, wrangler reloads dist/ automatically');
let timer: ReturnType<typeof setTimeout> | undefined;
for await (const event of Deno.watchFs('src', { recursive: true })) {
  if (event.kind === 'access') continue;
  clearTimeout(timer);
  timer = setTimeout(rebuild, DEBOUNCE_MS);
}
