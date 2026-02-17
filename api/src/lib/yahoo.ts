import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

type Period = "1D" | "5D" | "1M" | "6M" | "YTD" | "1Y" | "5Y" | "MAX";

interface PricePoint {
	date: string;
	close: number;
}

type Interval =
	| "1m"
	| "2m"
	| "5m"
	| "15m"
	| "30m"
	| "60m"
	| "90m"
	| "1h"
	| "1d"
	| "5d"
	| "1wk"
	| "1mo"
	| "3mo";

const periodConfig: Record<Period, { range: string; interval: Interval }> = {
	"1D": { range: "1d", interval: "5m" },
	"5D": { range: "5d", interval: "15m" },
	"1M": { range: "1mo", interval: "1d" },
	"6M": { range: "6mo", interval: "1d" },
	YTD: { range: "ytd", interval: "1d" },
	"1Y": { range: "1y", interval: "1d" },
	"5Y": { range: "5y", interval: "1wk" },
	MAX: { range: "max", interval: "1mo" },
};

export async function getHistory(
	symbol: string,
	opts: { period?: Period; from?: string; to?: string },
): Promise<PricePoint[]> {
	try {
		if (opts.from && opts.to) {
			const result = await yahooFinance.chart(
				symbol,
				{
					period1: opts.from,
					period2: opts.to,
					interval: "1d",
				},
				{ validateResult: false },
			);
			return mapQuotes(result);
		}

		const period = opts.period ?? "1M";
		const config = periodConfig[period];

		const result = await yahooFinance.chart(
			symbol,
			{
				period1: getStartDate(config.range),
				interval: config.interval,
			},
			{ validateResult: false },
		);

		return mapQuotes(result);
	} catch (e) {
		console.error("Yahoo Finance error:", e);
		return [];
	}
}

// biome-ignore lint/suspicious/noExplicitAny: yahoo-finance2 has complex overloaded types
function mapQuotes(result: any): PricePoint[] {
	const quotes = result?.quotes ?? [];
	return quotes.map((q: { date: Date; close: number | null }) => ({
		date: new Date(q.date).toISOString(),
		close: q.close ?? 0,
	}));
}

function getStartDate(range: string): string {
	const now = new Date();

	switch (range) {
		case "1d":
			now.setDate(now.getDate() - 1);
			break;
		case "5d":
			now.setDate(now.getDate() - 5);
			break;
		case "1mo":
			now.setMonth(now.getMonth() - 1);
			break;
		case "6mo":
			now.setMonth(now.getMonth() - 6);
			break;
		case "ytd":
			return `${now.getFullYear()}-01-01`;
		case "1y":
			now.setFullYear(now.getFullYear() - 1);
			break;
		case "5y":
			now.setFullYear(now.getFullYear() - 5);
			break;
		case "max":
			return "1970-01-01";
		default:
			now.setMonth(now.getMonth() - 1);
	}

	return now.toISOString().split("T")[0]!;
}
