import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

type Period = "1D" | "5D" | "1M" | "6M" | "YTD" | "1Y" | "5Y" | "MAX";

interface PricePoint {
  close: number;
  date: string;
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

const periodConfig: Record<
  Period,
  {
    calendarDays: number | "ytd" | "max";
    interval: Interval;
    tradingDays?: number;
  }
> = {
  "1D": { calendarDays: 7, interval: "5m", tradingDays: 1 },
  "5D": { calendarDays: 10, interval: "15m", tradingDays: 5 },
  "1M": { calendarDays: 35, interval: "1d" },
  "6M": { calendarDays: 190, interval: "1d" },
  YTD: { calendarDays: "ytd", interval: "1d" },
  "1Y": { calendarDays: 370, interval: "1d" },
  "5Y": { calendarDays: 1830, interval: "1wk" },
  MAX: { calendarDays: "max", interval: "1mo" },
};

export async function getHistory(
  symbol: string,
  opts: { period?: Period; from?: string; to?: string }
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
        { validateResult: false }
      );
      return mapQuotes(result);
    }

    const period = opts.period ?? "1M";
    const config = periodConfig[period];
    const period1 = getStartDate(config.calendarDays);

    const result = await yahooFinance.chart(
      symbol,
      { period1, interval: config.interval },
      { validateResult: false }
    );
    let points = mapQuotes(result);

    // For intraday periods, trim to the exact number of trading sessions requested.
    // Sessions are detected by time gaps (>2h between points = new session),
    // since trading hours can span UTC midnight.
    if (config.tradingDays && points.length > 0) {
      const sessions: PricePoint[][] = [[]];
      for (let i = 0; i < points.length; i++) {
        if (i > 0) {
          const gap =
            new Date(points[i].date).getTime() -
            new Date(points[i - 1].date).getTime();
          if (gap > 2 * 60 * 60 * 1000) {
            sessions.push([]);
          }
        }
        sessions.at(-1)?.push(points[i]);
      }
      points = sessions.slice(-config.tradingDays).flat();
    }

    return points;
  } catch (e) {
    console.error("Yahoo Finance error:", e);
    return [];
  }
}

export interface ETFDetails {
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

const EXCHANGE_ALIASES: Record<string, string> = {
  NYSEArca: "NYSE",
  NasdaqGM: "NASDAQ",
  NasdaqGS: "NASDAQ",
  NasdaqCM: "NASDAQ",
};

const PROVIDER_URL_PATTERNS: Record<string, (symbol: string) => string> = {
  Vanguard: (s) =>
    `https://investor.vanguard.com/investment-products/etfs/profile/${s}`,
  iShares: (s) => `https://www.ishares.com/us/products/${s}`,
  SPDR: (s) =>
    `https://www.ssga.com/us/en/intermediary/etfs/funds/${s.toLowerCase()}`,
  Invesco: (s) =>
    `https://www.invesco.com/us/financial-products/etfs/product-detail?audienceType=Investor&ticker=${s}`,
  "ARK ETF Trust": (s) => `https://ark-funds.com/funds/${s.toLowerCase()}`,
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
        modules: ["price", "summaryProfile", "fundProfile", "topHoldings"],
      },
      { validateResult: false }
    );

    const name = result.price?.longName || result.price?.shortName || symbol;
    const provider = result.fundProfile?.family || "Unknown";
    const description = result.summaryProfile?.longBusinessSummary || "";
    const rawMer =
      result.fundProfile?.feesExpensesInvestment?.annualReportExpenseRatio;
    // Yahoo returns MER as a decimal (e.g. 0.0009 = 0.09%), convert to percentage
    const mer = rawMer ? +(rawMer * 100).toFixed(2) : 0;

    // Try to extract top holdings as a proxy for country exposure
    // Yahoo doesn't provide country breakdown directly, so we skip it
    const topCountries: { country: string; allocation: number }[] = [];

    const productUrl = buildProductUrl(symbol, provider);
    const rawExchange: string = result.price?.exchangeName || "Unknown";
    const exchange = EXCHANGE_ALIASES[rawExchange] ?? rawExchange;
    const currency = result.price?.currency || "USD";
    const currentPrice = result.price?.regularMarketPrice ?? 0;

    return {
      symbol,
      name,
      description,
      mer,
      topCountries,
      productUrl,
      provider,
      exchange,
      currency,
      currentPrice,
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
      exchange: "Unknown",
      currency: "USD",
      currentPrice: 0,
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
    })
  );

  // Drop trailing zero-close points (Yahoo sometimes returns an incomplete last candle)
  while (points.length > 1 && points.at(-1)?.close === 0) {
    points.pop();
  }

  return points;
}

function getStartDate(calendarDays: number | "ytd" | "max"): string {
  if (calendarDays === "max") {
    return "1970-01-01";
  }
  const now = new Date();
  if (calendarDays === "ytd") {
    return `${now.getFullYear()}-01-01`;
  }
  now.setDate(now.getDate() - calendarDays);
  return now.toISOString().split("T")[0] ?? "";
}
