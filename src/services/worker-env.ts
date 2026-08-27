import { Context, Layer } from 'effect'

// Exposes the Worker's Cloudflare bindings (vars, D1, KV, R2, Queues, ...) to
// Effect workflows. Bindings only exist per request in Workers, so the layer
// is built from `c.env` near the entrypoint (see layers.ts).
export class WorkerEnv extends Context.Service<WorkerEnv, CloudflareBindings>()(
  'WorkerEnv',
) {}

export const workerEnvLayer = (env: CloudflareBindings) =>
  Layer.succeed(WorkerEnv, env)
