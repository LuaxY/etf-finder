import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

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

export interface ETFDetails {
	symbol: string;
	name: string;
	description: string;
	mer: number;
	topCountries: { country: string; allocation: number }[];
	productUrl: string;
	provider: string;
}

const PROVIDER_URL_PATTERNS: Record<string, (symbol: string) => string> = {
	Vanguard: (s) =>
		`https://investor.vanguard.com/investment-products/etfs/profile/${s}`,
	iShares: (s) =>
		`https://www.ishares.com/us/products/${s}`,
	SPDR: (s) =>
		`https://www.ssga.com/us/en/intermediary/etfs/funds/${s.toLowerCase()}`,
	Invesco: (s) =>
		`https://www.invesco.com/us/financial-products/etfs/product-detail?audienceType=Investor&ticker=${s}`,
	"ARK ETF Trust": (s) =>
		`https://ark-funds.com/funds/${s.toLowerCase()}`,
	"Global X Funds": (s) =>
		`https://www.globalxetfs.com/funds/${s.toLowerCase()}`,
};

function buildProductUrl(symbol: string, provider: string): string {
	for (const [key, builder] of Object.entries(PROVIDER_URL_PATTERNS)) {
		if (provider.toLowerCase().includes(key.toLowerCase())) {
			return builder(symbol);
		}
	}
	return `https://finance.yahoo.com/quote/${symbol}`;
}

export async function getETFDetails(symbol: string): Promise<ETFDetails> {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: yahoo-finance2 has complex types
		const result: any = await yahooFinance.quoteSummary(
			symbol,
			{
				modules: [
					"price",
					"summaryProfile",
					"fundProfile",
					"topHoldings",
				],
			},
			{ validateResult: false },
		);

		const name =
			result.price?.longName ||
			result.price?.shortName ||
			symbol;
		const provider = result.fundProfile?.family || "Unknown";
		const description =
			result.summaryProfile?.longBusinessSummary || "";
		const rawMer =
			result.fundProfile?.feesExpensesInvestment?.annualReportExpenseRatio;
		// Yahoo returns MER as a decimal (e.g. 0.0009 = 0.09%), convert to percentage
		const mer = rawMer ? +(rawMer * 100).toFixed(2) : 0;

		// Try to extract top holdings as a proxy for country exposure
		// Yahoo doesn't provide country breakdown directly, so we skip it
		const topCountries: { country: string; allocation: number }[] = [];

		const productUrl = buildProductUrl(symbol, provider);

		return {
			symbol,
			name,
			description,
			mer,
			topCountries,
			productUrl,
			provider,
		};
	} catch (e) {
		console.error(`Failed to fetch details for ${symbol}:`, e);
		return {
			symbol,
			name: symbol,
			description: "",
			mer: 0,
			topCountries: [],
			productUrl: `https://finance.yahoo.com/quote/${symbol}`,
			provider: "Unknown",
		};
	}
}

// biome-ignore lint/suspicious/noExplicitAny: yahoo-finance2 has complex overloaded types
function mapQuotes(result: any): PricePoint[] {
	const quotes = result?.quotes ?? [];
	const points: PricePoint[] = quotes.map(
		(q: { date: Date; close: number | null }) => ({
			date: new Date(q.date).toISOString(),
			close: q.close ?? 0,
		}),
	);

	// Drop trailing zero-close points (Yahoo sometimes returns an incomplete last candle)
	while (points.length > 1 && points[points.length - 1].close === 0) {
		points.pop();
	}

	return points;
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
