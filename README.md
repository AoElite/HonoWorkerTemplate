# Hono Cloudflare Worker Template

A minimal starter template for building [Cloudflare Workers](https://developers.cloudflare.com/workers/) with [Hono](https://hono.dev/) and TypeScript.

## What's included

- [Hono](https://hono.dev/) — small, fast web framework for the edge
- TypeScript with strict mode
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) for local dev and deploys
- Generated binding types via `wrangler types` (`CloudflareBindings`)
- Testing with [Vitest](https://vitest.dev/) and [`@cloudflare/vitest-plugin`](https://developers.cloudflare.com/workers/testing/vitest-integration/) — tests run inside the actual Workers runtime
- Environment variable setup with a committed [`.env.example`](./.env.example)
- Request logging middleware and a `/health` endpoint as starting points

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (for deploying)

## Getting started

```sh
npm install
npm run dev
```

The Worker is served at http://localhost:8787.

## Scripts

| Script               | Description                                                        |
| -------------------- | ------------------------------------------------------------------ |
| `npm run dev`        | Run the Worker locally with Wrangler                               |
| `npm run deploy`     | Deploy the Worker to Cloudflare (minified)                         |
| `npm test`           | Run tests once with Vitest                                         |
| `npm run test:watch` | Run tests in watch mode                                            |
| `npm run typecheck`  | Type-check the app and tests with `tsc`                            |
| `npm run cf-typegen` | Regenerate `worker-configuration.d.ts` from `wrangler.jsonc`       |

## Testing

Tests live in [`test/`](./test) and run inside the Workers runtime (workerd) via [`@cloudflare/vitest-plugin`](https://developers.cloudflare.com/workers/testing/vitest-integration/), so runtime APIs and bindings behave exactly as they do in production:

```ts
import { exports } from 'cloudflare:workers'

const res = await exports.default.fetch('https://example.com/')
```

`exports.default.fetch()` dispatches a request to the Worker's default export — see [`test/index.spec.ts`](./test/index.spec.ts). Bindings are available in tests via `import { env } from 'cloudflare:workers'`, and helpers like `createExecutionContext()` for unit tests come from `cloudflare:test`.

## Bindings

Configure bindings (KV, R2, D1, vars, etc.) in [`wrangler.jsonc`](./wrangler.jsonc) — commented examples are included. After changing the config, regenerate the types:

```sh
npm run cf-typegen
```

The generated `CloudflareBindings` interface is passed to Hono in [`src/index.ts`](./src/index.ts), so bindings are fully typed on `c.env`:

```ts
const app = new Hono<{ Bindings: CloudflareBindings }>()

app.get('/example', (c) => {
  // c.env.MY_KV_NAMESPACE, c.env.MY_VAR, ... are typed here
  return c.text('ok')
})
```

Types are also generated automatically after `npm install` (via the `postinstall` script).

## Environment variables & secrets

For local development, copy the example file and fill in your values:

```sh
cp .env.example .env
npm run cf-typegen
```

`wrangler dev` loads `.env` (gitignored) automatically and exposes the values on `c.env`. Re-running `cf-typegen` keeps the `CloudflareBindings` interface in sync with the variables you define, so they are fully typed. (`.dev.vars` is also supported — use one or the other, not both.)

Non-secret configuration belongs in the `vars` section of `wrangler.jsonc`. For production secrets, use:

```sh
npx wrangler secret put SECRET_NAME
```

## Deploying

```sh
npm run deploy
```

Wrangler will prompt you to log in to your Cloudflare account on first use.
