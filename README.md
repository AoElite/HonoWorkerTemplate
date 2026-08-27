# Hono Cloudflare Worker Template

A minimal starter template for building [Cloudflare Workers](https://developers.cloudflare.com/workers/) with [Hono](https://hono.dev/) and TypeScript.

## What's included

- [Hono](https://hono.dev/) — small, fast web framework for the edge
- TypeScript with strict mode
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) for local dev and deploys
- Generated binding types via `wrangler types` (`CloudflareBindings`)
- Testing with [Vitest](https://vitest.dev/) and [`@cloudflare/vitest-plugin`](https://developers.cloudflare.com/workers/testing/vitest-integration/) — tests run inside the actual Workers runtime
- Request validation with [Zod](https://zod.dev/) via [`@hono/zod-validator`](https://github.com/honojs/middleware/tree/main/packages/zod-validator)
- Linting and formatting with [Biome](https://biomejs.dev/)
- Environment variable setup with a committed [`.env.example`](./.env.example)
- JSON `notFound`/`onError` handlers, request logging, and a `/health` endpoint
- GitHub Actions CI (lint, typecheck, test) and weekly [Dependabot](./.github/dependabot.yml) updates

## Using this template

Click **Use this template** on GitHub to create your own repository from it, then:

1. Rename the project in [`package.json`](./package.json) (`name`) and [`wrangler.jsonc`](./wrangler.jsonc) (`name`).
2. Run `npm install` and start building.

> Repo owners: enable **Settings → Template repository** so the button appears.

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (for deploying)

## Getting started

```sh
npm install
npm run dev
```

The Worker is served at http://localhost:8787.

### Example routes

| Route          | Description                                             |
| -------------- | ------------------------------------------------------- |
| `GET /`        | Plain-text greeting                                     |
| `GET /health`  | JSON health check                                       |
| `GET /motd`    | Returns the `API_MOTD` environment variable             |
| `POST /greet`  | Zod-validated JSON body (`{ "name": "..." }`)           |

## Scripts

| Script               | Description                                                        |
| -------------------- | ------------------------------------------------------------------ |
| `npm run dev`        | Run the Worker locally with Wrangler                               |
| `npm run deploy`     | Deploy the Worker to Cloudflare (regenerates types first, minified) |
| `npm test`           | Run tests once with Vitest                                         |
| `npm run test:watch` | Run tests in watch mode                                            |
| `npm run lint`       | Lint and check formatting with Biome                               |
| `npm run lint:fix`   | Apply safe lint/format fixes                                       |
| `npm run format`     | Format all files with Biome                                        |
| `npm run typecheck`  | Type-check the app and tests with `tsc`                            |
| `npm run cf-typegen` | Regenerate `worker-configuration.d.ts` from `wrangler.jsonc`       |

Types are regenerated automatically after `npm install` (`postinstall`) and before every deploy (`predeploy`).

## Testing

Tests live in [`test/`](./test) and run inside the Workers runtime (workerd) via [`@cloudflare/vitest-plugin`](https://developers.cloudflare.com/workers/testing/vitest-integration/), so runtime APIs and bindings behave exactly as they do in production:

```ts
import { env, exports } from 'cloudflare:workers'

const res = await exports.default.fetch('https://example.com/')
```

`exports.default.fetch()` dispatches a request to the Worker's default export, and `env` exposes the same typed bindings the Worker sees — see [`test/index.spec.ts`](./test/index.spec.ts). Helpers like `createExecutionContext()` for unit tests come from `cloudflare:test`.

## Bindings

Configure bindings (KV, R2, D1, vars, etc.) in [`wrangler.jsonc`](./wrangler.jsonc) — commented examples are included. After changing the config, regenerate the types:

```sh
npm run cf-typegen
```

The generated `CloudflareBindings` interface is passed to Hono in [`src/index.ts`](./src/index.ts), so bindings are fully typed on `c.env`:

```ts
const app = new Hono<{ Bindings: CloudflareBindings }>()

app.get('/example', (c) => {
  // c.env.MY_KV_NAMESPACE, c.env.API_MOTD, ... are typed here
  return c.text('ok')
})
```

## Environment variables & secrets

Non-secret configuration with deployed defaults lives in the `vars` section of [`wrangler.jsonc`](./wrangler.jsonc) (see `API_MOTD`). To override values locally, copy the example file:

```sh
cp .env.example .env
npm run cf-typegen
```

`wrangler dev` loads `.env` (gitignored) automatically and exposes the values on `c.env`. Re-running `cf-typegen` keeps the `CloudflareBindings` interface in sync with the variables you define, so they are fully typed. (`.dev.vars` is also supported — use one or the other, not both.)

For production secrets, use:

```sh
npx wrangler secret put SECRET_NAME
```

## Continuous integration

[`ci.yml`](./.github/workflows/ci.yml) runs lint, typecheck, and tests on every pull request and push to `main`. It needs no secrets or repository variables. Deploys are left to you — add a deploy job with [`cloudflare/wrangler-action`](https://github.com/cloudflare/wrangler-action) if you want them automated.

## Deploying

```sh
npm run deploy
```

Wrangler will prompt you to log in to your Cloudflare account on first use.
