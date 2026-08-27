import { exports } from 'cloudflare:workers'
import { describe, expect, it } from 'vitest'

// Integration-style tests: `exports.default.fetch()` dispatches real requests
// to the Worker defined in wrangler.jsonc, running inside the workerd runtime
// with all configured bindings available.
describe('worker', () => {
  it('responds on the root route', async () => {
    const res = await exports.default.fetch('https://example.com/')

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Hello Hono!')
  })

  it('reports health as JSON', async () => {
    const res = await exports.default.fetch('https://example.com/health')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'ok' })
  })

  it('returns 404 for unknown routes', async () => {
    const res = await exports.default.fetch('https://example.com/does-not-exist')

    expect(res.status).toBe(404)
  })
})
