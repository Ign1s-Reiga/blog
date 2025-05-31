import { defineConfig } from 'vite';
import deno from '@deno/vite-plugin';
import ssg from '@hono/vite-ssg';
import devServer from '@hono/vite-dev-server';
import kumaUI from '@kuma-ui/vite';

// HACK: @kuma-ui/vite typed incorrectly. See: https://github.com/denoland/deno/issues/16458#issuecomment-1295003089
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const kumaUIConfig = kumaUI as any as typeof kumaUI.default;

export default defineConfig({
  plugins: [deno(), ssg(), devServer(), kumaUIConfig({ wasm: true })],
});
