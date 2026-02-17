import { Mastra } from "@mastra/core/mastra";
import { etfSearchWorkflow } from "./workflows/etf-search";

export const mastra = new Mastra({
  workflows: { etfSearchWorkflow },
});
