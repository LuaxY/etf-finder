import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { etfRoutes } from "./routes/etf";

const app = new Elysia().use(cors()).use(etfRoutes).listen(3001);

console.log(`Server running at http://localhost:${app.server?.port}`);
