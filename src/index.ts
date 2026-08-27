import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { logger } from 'hono/logger'
import { z } from 'zod'
import { ERROR_INTERNAL, ERROR_NOT_FOUND, WELCOME_MESSAGE } from './constants'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.use(logger())

app.get('/', (c) => {
  return c.text(WELCOME_MESSAGE)
})

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

app.get('/motd', (c) => {
  return c.json({ motd: c.env.API_MOTD })
})

const greetSchema = z.object({
  name: z.string().min(1),
})

app.post('/greet', zValidator('json', greetSchema), (c) => {
  const { name } = c.req.valid('json')
  return c.json({ message: `Hello, ${name}!` })
})

app.notFound((c) => {
  return c.json({ error: ERROR_NOT_FOUND }, 404)
})

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse()
  }
  console.error(err)
  return c.json({ error: ERROR_INTERNAL }, 500)
})

export default app
