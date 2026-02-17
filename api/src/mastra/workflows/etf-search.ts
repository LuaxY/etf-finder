import { createStep, createWorkflow } from "@mastra/core/workflows";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const openrouter = createOpenAI({
	baseURL: "https://openrouter.ai/api/v1",
	apiKey: process.env.OPENROUTER_API_KEY,
});

const etfSchema = z.object({
	symbol: z.string(),
	name: z.string(),
	description: z.string(),
	mer: z.number(),
	topCountries: z.array(
		z.object({ country: z.string(), allocation: z.number() }),
	),
	productUrl: z.string().url(),
	provider: z.string(),
});

const outputSchema = z.object({
	etfs: z.array(etfSchema),
	summary: z.string(),
});

export type ETF = z.infer<typeof etfSchema>;
export type ETFSearchOutput = z.infer<typeof outputSchema>;

const searchStep = createStep({
	id: "search-etfs",
	inputSchema: z.object({ industry: z.string() }),
	outputSchema,
	execute: async ({ inputData }) => {
		const result = await generateObject({
			model: openrouter("anthropic/claude-opus-4.6"),
			schema: outputSchema,
			prompt: `You are an ETF research analyst. Given the industry/sector "${inputData.industry}", recommend 3-5 relevant ETFs that provide exposure to this sector.

For each ETF, provide:
- symbol: The ticker symbol (e.g., "VGT", "XLK")
- name: The full fund name
- description: A brief description of the fund's strategy and holdings
- mer: The management expense ratio as a percentage number (e.g., 0.10 means 0.10%, 0.45 means 0.45%)
- topCountries: Top 3-5 country allocations with percentage (e.g., [{ country: "United States", allocation: 65.5 }])
- productUrl: The official product page URL from the ETF provider
- provider: The fund provider name (e.g., "Vanguard", "iShares")

Also provide a brief summary comparing the recommended ETFs and explaining which might be best for different investor profiles.

Focus on well-known, liquid ETFs with reasonable expense ratios. Prefer ETFs available on major US exchanges.`,
		});

		return result.object;
	},
});

export const etfSearchWorkflow = createWorkflow({
	id: "etf-search",
	inputSchema: z.object({ industry: z.string() }),
	outputSchema,
})
	.then(searchStep)
	.commit();
