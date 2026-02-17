import { join } from "node:path";
import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { etfRoutes } from "./routes/etf";

const port = Number(process.env.PORT) || 3001;
const distDir = join(import.meta.dirname, "../public");

const app = new Elysia()
  .use(cors())
  .use(etfRoutes)
  .get("/*", async ({ path }) => {
    const filePath = join(distDir, path);
    const file = Bun.file(filePath);

    if (await file.exists()) {
      return new Response(file);
    }

    return new Response(Bun.file(join(distDir, "index.html")));
  })
  .listen(port);

console.log(`Server running on port ${app.server?.port}`);
