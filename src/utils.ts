import { createDefine } from 'fresh';

export interface State {
  shared: string;
  env: Cloudflare.Env;
}

export const define = createDefine<State>();
