# Hono Cloudflare Worker Template

A minimal, type-safe starter for [Cloudflare Workers](https://developers.cloudflare.com/workers/) built with [Hono](https://hono.dev/) and [Effect](https://effect.website/) v4.

- TypeScript (strict, plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and `verbatimModuleSyntax`) + Wrangler 4, with generated binding types (`CloudflareBindings`)
- Effect Schema validation at the HTTP boundary, services & layers for dependencies, typed errors
- Vitest tests that run inside the Workers runtime
- [oxlint](https://oxc.rs/docs/guide/usage/linter) with type-aware rules (`no-floating-promises`, the `no-unsafe-*` family, exhaustive switches) & [oxfmt](https://oxc.rs/docs/guide/usage/formatter) formatting with import sorting, GitHub Actions CI
- Agent instructions in [`AGENTS.md`](./AGENTS.md), imported by [`CLAUDE.md`](./CLAUDE.md)

## Using this template

1. Click **Use this template** on GitHub (repo owners: enable **Settings → Template repository**).
2. Rename the project — the name lives in two places: `name` in [`package.json`](./package.json) and `name` in [`wrangler.jsonc`](./wrangler.jsonc) (the deployed Worker name).
3. Install and run — requires Node.js 24.18+ (see [`.node-version`](./.node-version)) and [pnpm](https://pnpm.io/) (pinned via `packageManager` in `package.json`; `corepack enable` picks it up automatically):

```sh
pnpm install
pnpm dev   # serves http://localhost:8787
```

## Routes

| Route         | Description                                      |
| ------------- | ------------------------------------------------ |
| `GET /`       | Plain-text greeting                              |
| `GET /health` | JSON health check                                |
| `GET /motd`   | Returns the `API_MOTD` var                       |
| `POST /greet` | Schema-validated JSON body (`{ "name": "..." }`) |

## Scripts

| Script            | Description                                    |
| ----------------- | ---------------------------------------------- |
| `pnpm dev`        | Run locally with Wrangler                      |
| `pnpm run deploy` | Deploy to Cloudflare (regenerates types first) |
| `pnpm test`       | Run tests (`test:watch` for watch mode)        |
| `pnpm check`      | All checks: typecheck, lint, tests             |
| `pnpm lint:fix`   | Apply safe lint/format fixes (`lint` to check) |
| `pnpm cf-typegen` | Regenerate types from `wrangler.jsonc`         |

## Linting & formatting

- **oxlint** ([`.oxlintrc.json`](./.oxlintrc.json)) runs the `correctness`, `suspicious`, and `perf` rule categories plus type-aware rules powered by `oxlint-tsgolint` — unawaited promises, `any` leaks, unsafe casts, and non-exhaustive switches are all lint errors.
- **oxfmt** ([`.oxfmtrc.json`](./.oxfmtrc.json)) uses the default (Prettier-compatible) style and sorts imports and `package.json`. `pnpm lint` fails on unformatted files; `pnpm format` fixes them.
- The recommended VS Code extension ([`.vscode/extensions.json`](./.vscode/extensions.json)) provides both in-editor.

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
- **Secrets** (never in `wrangler.jsonc`) — locally in `.env`, in production via `pnpm wrangler secret put API_SECRET_KEY`.
- **Bindings** (KV, R2, D1, ...) — commented examples in `wrangler.jsonc`.

For local development, copy [`.env.example`](./.env.example) to `.env` (gitignored). After changing config or `.env`, run `pnpm cf-typegen` to refresh `CloudflareBindings`; types also regenerate on `pnpm install` and before every deploy.

pnpm blocks dependency install scripts by default; the allowlist lives in [`pnpm-workspace.yaml`](./pnpm-workspace.yaml) (`esbuild` and `workerd` need theirs to install platform binaries). If a new dependency warns about ignored build scripts, add it there.

## Deploying

`pnpm run deploy` — Wrangler prompts for a Cloudflare login on first use. CI ([`ci.yml`](./.github/workflows/ci.yml)) runs lint, typecheck, and tests on pull requests with no secrets required; deploys are left to you.
