export interface ETF {
	symbol: string;
	name: string;
	description: string;
	mer: number;
	topCountries: { country: string; allocation: number }[];
	productUrl: string;
	provider: string;
	exchange: string;
	currency: string;
	currentPrice: number;
}

export interface SearchResponse {
	etfs: ETF[];
	summary: string;
}

export interface PricePoint {
	date: string;
	close: number;
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
