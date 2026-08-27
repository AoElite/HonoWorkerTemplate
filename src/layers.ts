import { Layer } from 'effect'
import { GreetingLive } from './services/greeting'
import { workerEnvLayer } from './services/worker-env'

// Composition root: wires the Worker's bindings into every service layer.
// Built per request from `c.env` (see index.ts); add new service layers here.
export const appLayer = (env: CloudflareBindings) =>
  GreetingLive.pipe(Layer.provide(workerEnvLayer(env)))
