# Hono Cloudflare Worker Template

A minimal starter template for building [Cloudflare Workers](https://developers.cloudflare.com/workers/) with [Hono](https://hono.dev/) and TypeScript.

## What's included

- [Hono](https://hono.dev/) — small, fast web framework for the edge
- TypeScript with strict mode
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) for local dev and deploys
- Generated binding types via `wrangler types` (`CloudflareBindings`)
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
| `npm run typecheck`  | Type-check the project with `tsc`                                  |
| `npm run cf-typegen` | Regenerate `worker-configuration.d.ts` from `wrangler.jsonc`       |

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

## Secrets

For local development, put secrets in a `.dev.vars` file (gitignored). For production, use:

```sh
npx wrangler secret put SECRET_NAME
```

## Deploying

```sh
npm run deploy
```

Wrangler will prompt you to log in to your Cloudflare account on first use.
