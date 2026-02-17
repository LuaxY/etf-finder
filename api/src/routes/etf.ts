import { Elysia, t } from "elysia";
import { getCached, setCache } from "../lib/cache";
import { generateSuggestions } from "../lib/suggestions";
import { getHistory } from "../lib/yahoo";
import { mastra } from "../mastra";

export const etfRoutes = new Elysia({ prefix: "/api/etfs" })
  .get(
    "/suggestions",
    async ({ query }) => {
      const q = query.q?.trim() ?? "";
      if (q.length < 2) {
        return { suggestions: [] };
      }

      const cacheKey = `suggestions:${q.toLowerCase()}`;
      const cached = getCached<{ suggestions: string[] }>(cacheKey);
      if (cached) {
        return cached;
      }

      try {
        const suggestions = await generateSuggestions(q);
        const result = { suggestions };
        setCache(cacheKey, result);
        return result;
      } catch (e) {
        console.error("Suggestions error:", e);
        return { suggestions: [] };
      }
    },
    {
      query: t.Object({
        q: t.Optional(t.String()),
      }),
    }
  )
  .post(
    "/search",
    async ({ body, error }) => {
      try {
        const key = body.industry.toLowerCase().trim();

        const cached = getCached(key);
        if (cached) {
          return cached;
        }

        const workflow = mastra.getWorkflow("etfSearchWorkflow");
        const run = await workflow.createRun();
        const result = await run.start({
          inputData: { industry: key },
        });

        if (result.status === "success") {
          setCache(key, result.result);
          return result.result;
        }

        console.error("Workflow failed:", JSON.stringify(result, null, 2));
        return error(500, { message: "Workflow failed" });
      } catch (e) {
        console.error("Search error:", e);
        return error(500, {
          message: e instanceof Error ? e.message : "Unknown error",
        });
      }
    },
    {
      body: t.Object({ industry: t.String() }),
    }
  )
  .get(
    "/:symbol/history",
    async ({ params, query, error }) => {
      try {
        const prices = await getHistory(params.symbol, {
          period: query.period as
            | "1D"
            | "5D"
            | "1M"
            | "6M"
            | "YTD"
            | "1Y"
            | "5Y"
            | "MAX"
            | undefined,
          from: query.from,
          to: query.to,
        });
        return { prices };
      } catch (e) {
        console.error("History error:", e);
        return error(500, {
          message: e instanceof Error ? e.message : "Unknown error",
        });
      }
    },
    {
      params: t.Object({ symbol: t.String() }),
      query: t.Object({
        period: t.Optional(t.String()),
        from: t.Optional(t.String()),
        to: t.Optional(t.String()),
      }),
    }
  );
