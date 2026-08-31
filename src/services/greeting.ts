import { Context, Data, Effect, Layer } from "effect";

import { WorkerEnv } from "./worker-env";

export class MotdNotConfiguredError extends Data.TaggedError("MotdNotConfiguredError") {}

export class Greeting extends Context.Service<
  Greeting,
  {
    readonly motd: Effect.Effect<string, MotdNotConfiguredError>;
    readonly greet: (name: string) => Effect.Effect<string>;
  }
>()("Greeting") {}

export const GreetingLive = Layer.effect(
  Greeting,
  Effect.gen(function* () {
    const env = yield* WorkerEnv;
    return {
      motd:
        env.API_MOTD.trim() === ""
          ? Effect.fail(new MotdNotConfiguredError())
          : Effect.succeed(env.API_MOTD),
      greet: (name) => Effect.succeed(`Hello, ${name}!`),
    };
  }),
);
