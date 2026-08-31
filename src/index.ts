import { Effect, Schema } from "effect";
import { type Context, Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";

import { ERROR_NOT_FOUND, WELCOME_MESSAGE } from "./constants";
import { appLayer } from "./layers";
import { Greeting, type MotdNotConfiguredError } from "./services/greeting";

type AppEnv = { Bindings: CloudflareBindings };

type AppError = Schema.SchemaError | MotdNotConfiguredError;

// Runs an Effect workflow for one request: provides the app layer built from
// the Worker's bindings and maps expected typed errors to HTTP responses.
// Unexpected defects reject the promise and land in `app.onError`.
const run = (c: Context<AppEnv>, program: Effect.Effect<Response, AppError, Greeting>) =>
  Effect.runPromise(
    program.pipe(
      Effect.catchTags({
        SchemaError: (error) =>
          Effect.succeed(c.json({ error: "Bad Request", message: error.message }, 400)),
        MotdNotConfiguredError: () => Effect.succeed(c.json({ error: "MOTD not configured" }, 500)),
      }),
      Effect.provide(appLayer(c.env)),
    ),
  );

const app = new Hono<AppEnv>();

app.use(logger());

app.get("/", (c) => {
  return c.text(WELCOME_MESSAGE);
});

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/motd", (c) =>
  run(
    c,
    Effect.gen(function* () {
      const greeting = yield* Greeting;
      const motd = yield* greeting.motd;
      return c.json({ motd });
    }),
  ),
);

const GreetBody = Schema.fromJsonString(Schema.Struct({ name: Schema.NonEmptyString }));

app.post("/greet", (c) =>
  run(
    c,
    Effect.gen(function* () {
      const raw = yield* Effect.promise(() => c.req.text());
      const { name } = yield* Schema.decodeUnknownEffect(GreetBody)(raw);
      const greeting = yield* Greeting;
      const message = yield* greeting.greet(name);
      return c.json({ message });
    }),
  ),
);

app.notFound((c) => {
  return c.json({ error: ERROR_NOT_FOUND }, 404);
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
