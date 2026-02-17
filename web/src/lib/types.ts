export interface ETF {
  currency: string;
  currentPrice: number;
  description: string;
  exchange: string;
  mer: number;
  name: string;
  productUrl: string;
  provider: string;
  symbol: string;
  topCountries: { country: string; allocation: number }[];
}

export interface SearchResponse {
  etfs: ETF[];
  summary: string;
}

export interface PricePoint {
  close: number;
  date: string;
}

export interface HistoryResponse {
  prices: PricePoint[];
}

export type Period =
  | "1D"
  | "5D"
  | "1M"
  | "6M"
  | "YTD"
  | "1Y"
  | "5Y"
  | "MAX"
  | "custom";

export interface SuggestionsResponse {
  suggestions: string[];
}
