import ky from "ky";
import type { HistoryResponse, Period, SearchResponse } from "./types";

const api = ky.create({
	prefixUrl: "http://localhost:3001/api",
	timeout: 120_000,
});

export async function searchETFs(industry: string): Promise<SearchResponse> {
	return api.post("etfs/search", { json: { industry } }).json();
}

export async function getETFHistory(
	symbol: string,
	period: Period,
	from?: string,
	to?: string,
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
