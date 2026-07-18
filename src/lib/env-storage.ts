import { AsyncLocalStorage } from 'node:async_hooks';

export const envStorage = new AsyncLocalStorage<Cloudflare.Env>();
