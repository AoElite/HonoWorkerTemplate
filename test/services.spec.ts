import { env } from 'cloudflare:workers'
import { Effect } from 'effect'
import { describe, expect, it } from 'vitest'
import { appLayer } from '../src/layers'
import { Greeting } from '../src/services/greeting'

// Unit-style tests: workflows run against the app layer directly, no HTTP
// involved. `env` supplies the same typed bindings the Worker sees.
describe('services', () => {
  it('resolves the greeting service from the app layer', async () => {
    const program = Effect.gen(function* () {
      const greeting = yield* Greeting
      return {
        motd: yield* greeting.motd,
        message: yield* greeting.greet('Hono'),
      }
    })

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(appLayer(env))),
    )

    expect(result.motd).toBe(env.API_MOTD)
    expect(result.message).toBe('Hello, Hono!')
  })
})
