import { join } from "node:path";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import { etfRoutes } from "./routes/etf";

const port = Number(process.env.PORT) || 3001;

const app = new Elysia()
  .use(cors())
  .use(etfRoutes)
  .use(
    staticPlugin({
      assets: join(import.meta.dirname, "../../web/dist"),
      prefix: "/",
      indexHTML: true,
    })
  )
  .listen(port);

console.log(`Server running at http://localhost:${app.server?.port}`);
