import { env, exports } from 'cloudflare:workers'
import { describe, expect, it } from 'vitest'
import { ERROR_NOT_FOUND, WELCOME_MESSAGE } from '../src/constants'

const BASE_URL = 'https://example.com'

// Integration-style tests: `exports.default.fetch()` dispatches real requests
// to the Worker defined in wrangler.jsonc, running inside the workerd runtime
// with all configured bindings available.
describe('worker', () => {
  it('responds on the root route', async () => {
    const res = await exports.default.fetch(`${BASE_URL}/`)

    expect(res.status).toBe(200)
    expect(await res.text()).toBe(WELCOME_MESSAGE)
  })

  it('reports health as JSON', async () => {
    const res = await exports.default.fetch(`${BASE_URL}/health`)

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'ok' })
  })

  it('serves the configured message of the day', async () => {
    const res = await exports.default.fetch(`${BASE_URL}/motd`)

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ motd: env.API_MOTD })
  })

  it('greets a valid name', async () => {
    const res = await exports.default.fetch(`${BASE_URL}/greet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Hono' }),
    })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ message: 'Hello, Hono!' })
  })

  it('rejects an invalid greet payload', async () => {
    const res = await exports.default.fetch(`${BASE_URL}/greet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    })

    expect(res.status).toBe(400)
  })

  it('returns a JSON 404 for unknown routes', async () => {
    const res = await exports.default.fetch(`${BASE_URL}/does-not-exist`)

    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: ERROR_NOT_FOUND })
  })
})
