import * as Sentry from "@sentry/bun";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? "production",
  enabled: !!process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

import { join } from "node:path";
import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { etfRoutes } from "./routes/etf";
import { subscribeRoutes } from "./routes/subscribe";

const port = Number(process.env.PORT) || 3001;
const distDir = join(import.meta.dirname, "../public");

const app = new Elysia()
  .use(cors())
  .onError(({ error, request }) => {
    Sentry.captureException(error, {
      extra: { url: request.url, method: request.method },
    });
    throw error;
  })
  .use(etfRoutes)
  .use(subscribeRoutes)
  .get("/*", async ({ path }) => {
    const filePath = join(distDir, path);
    const file = Bun.file(filePath);

    if (await file.exists()) {
      return new Response(file);
    }

    return new Response(Bun.file(join(distDir, "index.html")));
  })
  .listen(port);

console.log(`Listening on port ${app.server?.port}`);
