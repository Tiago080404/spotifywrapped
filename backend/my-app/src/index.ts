import { serve } from '@hono/node-server'
import dotenv from 'dotenv'
dotenv.config()

import { app } from './app.js'

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {},
)
