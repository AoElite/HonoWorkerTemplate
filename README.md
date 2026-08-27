# Hono Cloudflare Worker Template

A minimal, type-safe starter for [Cloudflare Workers](https://developers.cloudflare.com/workers/) built with [Hono](https://hono.dev/) and [Effect](https://effect.website/) v4.

- TypeScript (strict) + Wrangler 4, with generated binding types (`CloudflareBindings`)
- Effect Schema validation at the HTTP boundary, services & layers for dependencies, typed errors
- Vitest tests that run inside the Workers runtime
- Biome linting & formatting, GitHub Actions CI
- Agent instructions in [`AGENTS.md`](./AGENTS.md), imported by [`CLAUDE.md`](./CLAUDE.md)

## Using this template

1. Click **Use this template** on GitHub (repo owners: enable **Settings → Template repository**).
2. Rename the project — the name lives in two places: `name` in [`package.json`](./package.json) and `name` in [`wrangler.jsonc`](./wrangler.jsonc) (the deployed Worker name).
3. Install and run (requires Node.js 20+):

```sh
npm install
npm run dev   # serves http://localhost:8787
```

## Routes

| Route         | Description                                      |
| ------------- | ------------------------------------------------ |
| `GET /`       | Plain-text greeting                              |
| `GET /health` | JSON health check                                |
| `GET /motd`   | Returns the `API_MOTD` var                       |
| `POST /greet` | Schema-validated JSON body (`{ "name": "..." }`) |

## Scripts

| Script               | Description                                    |
| -------------------- | ---------------------------------------------- |
| `npm run dev`        | Run locally with Wrangler                      |
| `npm run deploy`     | Deploy to Cloudflare (regenerates types first) |
| `npm test`           | Run tests (`test:watch` for watch mode)        |
| `npm run check`      | All checks: typecheck, lint, tests             |
| `npm run lint:fix`   | Apply safe lint/format fixes (`lint` to check) |
| `npm run cf-typegen` | Regenerate types from `wrangler.jsonc`         |

## Project structure

```
src/
  index.ts     Hono app — thin handlers: decode input → Effect workflow → HTTP
  layers.ts    Composition root — wires Cloudflare bindings into service layers
  services/    Effect services (Context.Service + Layer)
test/          Vitest, runs inside workerd — HTTP integration + service tests
```

Handlers decode untrusted input with Effect Schema, run an Effect workflow, and map typed errors to HTTP responses in one place. Expected failures are typed on the error channel; defects fall through to `app.onError`.

## Configuration

- **Vars** (non-secret, deployed defaults) — `vars` in [`wrangler.jsonc`](./wrangler.jsonc), e.g. `API_MOTD`.
- **Secrets** (never in `wrangler.jsonc`) — locally in `.env`, in production via `npx wrangler secret put API_SECRET_KEY`.
- **Bindings** (KV, R2, D1, ...) — commented examples in `wrangler.jsonc`.

For local development, copy [`.env.example`](./.env.example) to `.env` (gitignored). After changing config or `.env`, run `npm run cf-typegen` to refresh `CloudflareBindings`; types also regenerate on `npm install` and before every deploy.

## Deploying

`npm run deploy` — Wrangler prompts for a Cloudflare login on first use. CI ([`ci.yml`](./.github/workflows/ci.yml)) runs lint, typecheck, and tests on pull requests with no secrets required; deploys are left to you.
