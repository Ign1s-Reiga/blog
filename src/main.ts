import { App, HttpError, staticFiles } from 'fresh';
import { type State } from '@/utils.ts';

export const app = new App<State>()
  .use(staticFiles())
  .use(async (ctx) => {
    // On Cloudflare Workers the exported fetch handler is called as
    // fetch(request, env, executionCtx); Fresh stores the second argument as
    // ctx.info, so on workerd it holds the bindings (D1/R2/vars).
    console.log(`${ctx.req.method}: ${ctx.req.url}`);
    try {
      ctx.state.env = ctx.info as unknown as Cloudflare.Env;
      return await ctx.next();
    } catch (err) {
      // Fresh renders the error page without logging the cause; surface it
      // for `wrangler dev` / `wrangler tail`. HttpError is intentional
      // control flow (404s etc.), not worth logging.
      if (!(err instanceof HttpError)) {
        console.error(`Unhandled error for ${ctx.req.method} ${ctx.req.url}:`, err);
      }
      throw err;
    }
  })
  .fsRoutes();
