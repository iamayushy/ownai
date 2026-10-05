// Node entry point for hosts that run a server (Atlair, Docker). Cloudflare
// Workers still uses src/index.ts directly through wrangler.
import { serve } from '@hono/node-server'
import app from './index'

const port = Number(process.env.PORT ?? 8080)

serve({ fetch: app.fetch, port, hostname: '0.0.0.0' }, (info) => {
  console.log(`Listening on http://${info.address}:${info.port}`)
})
