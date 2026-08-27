# AGENTS.md

Keep this Hono + TypeScript + Cloudflare Workers project maintainable, reusable, and type-safe.

- Prioritize type safety; avoid `any`, unsafe casts, and type workarounds.
- Reuse shared types, constants, utilities, and abstractions; avoid duplicated logic.
- Extract a constant, type, or helper only when it is used in more than one place; keep single-use values inline.
- Keep handlers and modules focused and within established boundaries.
- Prefer Hono's typed APIs.
- Model dependencies as Effect services with layers; wire Cloudflare bindings into layers in `src/layers.ts`, and do not construct services directly in handlers.
- Keep handlers thin: decode input, run the Effect workflow, map results and typed errors to HTTP responses.
- Model expected failures as typed Effect errors; reserve defects for the unexpected.
- Validate all external input with Effect Schema, including body, query, params, and relevant headers.
- Keep validation close to the endpoint it protects.
- Keep status codes and response shapes consistent.
- Follow Biome and TypeScript rules; do not bypass checks without justification.
- Preserve Cloudflare Workers compatibility.
- Update tests when behavior changes.
- Run project checks before finishing.
