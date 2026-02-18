import { createStep, createWorkflow } from "@mastra/core/workflows";
import { generateObject } from "ai";
import { z } from "zod";
import { openrouter } from "../../lib/openrouter";
import { type ETFDetails, getETFDetails } from "../../lib/yahoo";

// Step 1: AI picks symbols with country allocations and explains why
const aiPickSchema = z.object({
  picks: z
    .array(
      z.object({
        symbol: z.string().describe("ETF ticker symbol (e.g. VGT, XLK)"),
        topCountries: z
          .array(
            z.object({
              country: z
                .string()
                .describe("Full country name (e.g. United States, Japan)"),
              allocation: z
                .number()
                .describe("Approximate allocation percentage (e.g. 65.5)"),
            })
          )
          .describe("Top countries by allocation weight"),
      })
    )
    .describe("3-5 ETF picks"),
  summary: z
    .string()
    .describe(
      "2-3 sentences explaining why these specific ETFs were chosen for this industry/theme"
    ),
});

const pickStep = createStep({
  id: "pick-etfs",
  inputSchema: z.object({ industry: z.string() }),
  outputSchema: aiPickSchema,
  execute: async ({ inputData }) => {
    const result = await generateObject({
      model: openrouter("anthropic/claude-opus-4.6"),
      schema: aiPickSchema,
      prompt: `You are an ETF research analyst. Given the industry/sector/theme "${inputData.industry}", return 3-5 relevant ETF ticker symbols that provide the best exposure to this sector.

Pick well-known, liquid ETFs on major US exchanges with reasonable expense ratios. Prefer focused/thematic ETFs over broad market ones when the query is specific.

For each ETF, provide the approximate top country allocations by weight. Use full country names (e.g. "United States", not "US"). Allocations should roughly sum to 80-100%.

In the summary, briefly explain why you chose these specific ETFs and what differentiates them. Keep it to 2-3 sentences.`,
    });

    return result.object;
  },
});

// Step 2: Enrich each symbol with real data from Yahoo Finance (parallel, fast)
const etfSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  description: z.string(),
  mer: z.number(),
  topCountries: z.array(
    z.object({ country: z.string(), allocation: z.number() })
  ),
  productUrl: z.string(),
  provider: z.string(),
  exchange: z.string(),
  currency: z.string(),
  currentPrice: z.number(),
});

const outputSchema = z.object({
  etfs: z.array(etfSchema),
  summary: z.string(),
});

export type ETF = z.infer<typeof etfSchema>;
export type ETFSearchOutput = z.infer<typeof outputSchema>;

const enrichStep = createStep({
  id: "enrich-etfs",
  inputSchema: aiPickSchema,
  outputSchema,
  execute: async ({ inputData }) => {
    const details: ETFDetails[] = await Promise.all(
      inputData.picks.map((pick) => getETFDetails(pick.symbol))
    );

    // Merge AI-provided country data with Yahoo-enriched details,
    // filtering out symbols that don't exist on Yahoo Finance
    const etfs = details
      .map((detail, i) => ({
        ...detail,
        topCountries: inputData.picks[i]?.topCountries ?? [],
      }))
      .filter((etf) => etf.currentPrice > 0 && etf.provider !== "Unknown");

    return {
      etfs,
      summary: inputData.summary,
    };
  },
});

export const etfSearchWorkflow = createWorkflow({
  id: "etf-search",
  inputSchema: z.object({ industry: z.string() }),
  outputSchema,
})
  .then(pickStep)
  .then(enrichStep)
  .commit();
