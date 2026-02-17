import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const suggestionsSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe("5-8 ETF industry/theme search terms"),
});

export async function generateSuggestions(query: string): Promise<string[]> {
  const result = await generateObject({
    model: openrouter("openai/gpt-oss-safeguard-20b"),
    schema: suggestionsSchema,
    prompt: `You are an ETF search autocomplete engine. Given the partial search query "${query}", suggest 5-8 relevant ETF industry, sector, or theme search terms that a user might be looking for.

Return concise, natural search terms (e.g. "Clean Energy", "Semiconductor ETFs", "Nuclear Power", "AI & Robotics"). Focus on well-known ETF categories and investment themes. The suggestions should complete or expand on what the user is typing.`,
  });

  return result.object.suggestions;
}
