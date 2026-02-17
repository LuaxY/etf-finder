import ky from "ky";
import type {
  HistoryResponse,
  Period,
  SearchResponse,
  SuggestionsResponse,
} from "./types";

const api = ky.create({
  prefixUrl: "http://localhost:3001/api",
  timeout: 120_000,
});

export function searchETFs(
  industry: string,
  signal?: AbortSignal
): Promise<SearchResponse> {
  return api.post("etfs/search", { json: { industry }, signal }).json();
}

export function getSuggestions(q: string): Promise<SuggestionsResponse> {
  return api.get("etfs/suggestions", { searchParams: { q } }).json();
}

export function getETFHistory(
  symbol: string,
  period: Period,
  from?: string,
  to?: string
): Promise<HistoryResponse> {
  const searchParams: Record<string, string> = {};
  if (period === "custom" && from && to) {
    searchParams.from = from;
    searchParams.to = to;
  } else {
    searchParams.period = period;
  }
  return api.get(`etfs/${symbol}/history`, { searchParams }).json();
}
