import { defineConfig } from 'vite'
import deno from '@deno/vite-plugin'
import ssg from '@hono/vite-ssg'
import devServer from '@hono/vite-dev-server'

export default defineConfig({
  plugins: [deno(), ssg(), devServer()],
})
