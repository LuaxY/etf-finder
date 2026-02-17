import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ExternalLink,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import Markdown from "react-markdown";
import { useETFHistory } from "@/hooks/use-etf";
import type { ETF, Period } from "@/lib/types";
import { PerformanceChart } from "./performance-chart";
import { TimeHorizon } from "./time-horizon";

const COUNTRY_FLAGS: Record<string, string> = {
  "United States": "🇺🇸",
  USA: "🇺🇸",
  US: "🇺🇸",
  China: "🇨🇳",
  "Hong Kong": "🇭🇰",
  Japan: "🇯🇵",
  "South Korea": "🇰🇷",
  Korea: "🇰🇷",
  Taiwan: "🇹🇼",
  India: "🇮🇳",
  "United Kingdom": "🇬🇧",
  UK: "🇬🇧",
  Germany: "🇩🇪",
  France: "🇫🇷",
  Switzerland: "🇨🇭",
  Netherlands: "🇳🇱",
  Sweden: "🇸🇪",
  Denmark: "🇩🇰",
  Norway: "🇳🇴",
  Finland: "🇫🇮",
  Ireland: "🇮🇪",
  Italy: "🇮🇹",
  Spain: "🇪🇸",
  Belgium: "🇧🇪",
  Austria: "🇦🇹",
  Portugal: "🇵🇹",
  Luxembourg: "🇱🇺",
  Canada: "🇨🇦",
  Mexico: "🇲🇽",
  Brazil: "🇧🇷",
  Australia: "🇦🇺",
  "New Zealand": "🇳🇿",
  Singapore: "🇸🇬",
  Indonesia: "🇮🇩",
  Malaysia: "🇲🇾",
  Thailand: "🇹🇭",
  Philippines: "🇵🇭",
  Vietnam: "🇻🇳",
  Israel: "🇮🇱",
  "Saudi Arabia": "🇸🇦",
  "South Africa": "🇿🇦",
  Russia: "🇷🇺",
  Poland: "🇵🇱",
  Chile: "🇨🇱",
  Colombia: "🇨🇴",
  Peru: "🇵🇪",
  Argentina: "🇦🇷",
  Turkey: "🇹🇷",
  Greece: "🇬🇷",
};

function countryFlag(country: string): string {
  return COUNTRY_FLAGS[country] ?? "🌐";
}

const EXCHANGE_FLAGS: Record<string, string> = {
  NMS: "🇺🇸",
  NYQ: "🇺🇸",
  NGM: "🇺🇸",
  PCX: "🇺🇸",
  BTS: "🇺🇸",
  ASE: "🇺🇸",
  NCM: "🇺🇸",
  NYSE: "🇺🇸",
  NASDAQ: "🇺🇸",
  TOR: "🇨🇦",
  TSX: "🇨🇦",
  VAN: "🇨🇦",
  CNQ: "🇨🇦",
  LSE: "🇬🇧",
  IOB: "🇬🇧",
  GER: "🇩🇪",
  FRA: "🇩🇪",
  XETRA: "🇩🇪",
  PAR: "🇫🇷",
  EPA: "🇫🇷",
  AMS: "🇳🇱",
  EAM: "🇳🇱",
  MIL: "🇮🇹",
  MCE: "🇪🇸",
  STO: "🇸🇪",
  CPH: "🇩🇰",
  OSL: "🇳🇴",
  HEL: "🇫🇮",
  SWX: "🇨🇭",
  EBS: "🇨🇭",
  JPX: "🇯🇵",
  TYO: "🇯🇵",
  HKG: "🇭🇰",
  HKSE: "🇭🇰",
  KSC: "🇰🇷",
  KOE: "🇰🇷",
  TAI: "🇹🇼",
  TWO: "🇹🇼",
  ASX: "🇦🇺",
  NZE: "🇳🇿",
  SGX: "🇸🇬",
  SES: "🇸🇬",
  NSI: "🇮🇳",
  BSE: "🇮🇳",
  SAO: "🇧🇷",
  MEX: "🇲🇽",
};

function exchangeFlag(exchange: string): string {
  return EXCHANGE_FLAGS[exchange] ?? "🌐";
}

const COUNTRY_COLORS = [
  "bg-teal-600",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-violet-400",
  "bg-amber-400",
];

interface ETFTableProps {
  etfs: ETF[];
  summary: string;
}

function ExpandedContent({ etf }: { etf: ETF }) {
  const [period, setPeriod] = useState<Period>("1Y");
  const { data, isLoading } = useETFHistory(etf.symbol, period);

  return (
    <motion.div
      animate="visible"
      className="space-y-5 border-gray-100 border-t bg-gray-50/50 px-4 py-4 sm:px-6 sm:py-5"
      initial="hidden"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
    >
      {/* Top row: About (left) + Countries (right) */}
      <motion.div
        className="grid grid-cols-1 gap-5 lg:grid-cols-2"
        variants={{
          hidden: { opacity: 0, y: 8 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 300, damping: 24 },
          },
        }}
      >
        {/* About */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            {etf.description}
          </p>
          {etf.productUrl && (
            <a
              className="mt-3 inline-flex items-center gap-1.5 font-medium text-primary text-xs transition-colors hover:text-primary/80"
              href={etf.productUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Visit product page
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Geographic Exposure */}
        {etf.topCountries.length > 0 && (
          <div className="space-y-2.5 rounded-lg border border-gray-200 bg-white p-4">
            {etf.topCountries.map((c, i) => {
              const maxAllocation = Math.max(
                ...etf.topCountries.map((x) => x.allocation)
              );
              const barWidth = (c.allocation / maxAllocation) * 100;
              return (
                <div className="flex items-center gap-3" key={c.country}>
                  <span className="shrink-0 text-base leading-none">
                    {countryFlag(c.country)}
                  </span>
                  <span className="w-24 shrink-0 truncate text-gray-600 text-xs">
                    {c.country}
                  </span>
                  <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                      animate={{ width: `${barWidth}%` }}
                      className="absolute inset-y-0 left-0 rounded-full bg-primary/60"
                      initial={{ width: 0 }}
                      transition={{
                        delay: i * 0.08,
                        duration: 0.6,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right font-medium text-gray-500 text-xs tabular-nums">
                    {c.allocation.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Chart — full width below */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 8 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 300, damping: 24 },
          },
        }}
      >
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <PriceStats
            currency={etf.currency}
            currentPrice={etf.currentPrice}
            isLoading={isLoading}
            prices={data?.prices ?? []}
          />
          <TimeHorizon onChange={setPeriod} selected={period} />
        </div>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <PerformanceChart
            data={data?.prices ?? []}
            isLoading={isLoading}
            period={period}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

function PriceStats({
  currentPrice,
  currency,
  prices,
}: {
  currentPrice: number;
  currency: string;
  prices: { date: string; close: number }[];
  isLoading: boolean;
}) {
  const prevRef = useRef({ priceDiff: 0, pctChange: 0, hasData: false });

  const { priceDiff, pctChange, hasData } = useMemo(() => {
    if (!prices || prices.length < 2) {
      return prevRef.current;
    }
    const first = prices[0].close;
    const last = prices.at(-1)?.close ?? 0;
    const next = {
      priceDiff: last - first,
      pctChange: ((last - first) / first) * 100,
      hasData: true,
    };
    prevRef.current = next;
    return next;
  }, [prices]);

  const isPositive = priceDiff >= 0;
  const color = isPositive ? "text-emerald-600" : "text-red-500";

  const currencyFormat = useMemo(
    () => ({ style: "currency" as const, currency }),
    [currency]
  );
  const pctFormat = useMemo(
    () => ({
      style: "percent" as const,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      signDisplay: "always" as const,
    }),
    []
  );
  const diffFormat = useMemo(
    () => ({
      style: "currency" as const,
      currency,
      signDisplay: "always" as const,
    }),
    [currency]
  );

  return (
    <div className="flex items-baseline gap-2.5">
      <NumberFlow
        className="font-semibold text-gray-900 text-lg tabular-nums"
        format={currencyFormat}
        value={currentPrice}
      />
      {hasData && (
        <>
          <NumberFlow
            className={`font-medium text-sm tabular-nums ${color}`}
            format={diffFormat}
            value={priceDiff}
          />
          <div
            className={`flex items-center gap-0.5 font-medium text-sm ${color}`}
          >
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <NumberFlow
              className="tabular-nums"
              format={pctFormat}
              value={pctChange / 100}
            />
          </div>
        </>
      )}
    </div>
  );
}

export function ETFTable({ etfs, summary }: ETFTableProps) {
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);

  if (etfs.length === 0) {
    return null;
  }

  const toggle = (symbol: string) => {
    setExpandedSymbol((prev) => (prev === symbol ? null : symbol));
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 w-full sm:mt-8"
      exit={{ opacity: 0, y: -8 }}
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.3 }}
    >
      {summary && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="mb-3 flex items-center gap-2 font-medium text-gray-400 text-xs uppercase tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            AI Summary
          </div>
          <div className="prose prose-sm prose-gray prose-li:my-0.5 prose-ul:my-1 max-w-none prose-headings:font-semibold prose-a:text-primary prose-headings:text-gray-900 prose-headings:text-sm prose-strong:text-gray-900 text-gray-600 prose-p:leading-relaxed prose-a:no-underline hover:prose-a:underline">
            <Markdown>{summary}</Markdown>
          </div>
        </motion.div>
      )}
      <motion.div
        animate="visible"
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        initial="hidden"
        variants={{
          hidden: { opacity: 0, y: 12 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.35,
              ease: [0.25, 0.1, 0.25, 1],
              staggerChildren: 0.06,
              delayChildren: 0.1,
            },
          },
        }}
      >
        {etfs.map((etf, i) => {
          const isExpanded = expandedSymbol === etf.symbol;
          return (
            <ETFRow
              etf={etf}
              isExpanded={isExpanded}
              isLast={i === etfs.length - 1}
              key={etf.symbol}
              onToggle={() => toggle(etf.symbol)}
            />
          );
        })}
      </motion.div>
    </motion.div>
  );
}

function YearPerformance({ symbol }: { symbol: string }) {
  const { data, isLoading } = useETFHistory(symbol, "1Y");

  const pctChange = useMemo(() => {
    if (!data?.prices || data.prices.length < 2) {
      return null;
    }
    const first = data.prices[0].close;
    const last = data.prices.at(-1)?.close ?? 0;
    return ((last - first) / first) * 100;
  }, [data]);

  if (isLoading) {
    return (
      <div className="hidden w-20 shrink-0 text-right sm:block">
        <div className="ml-auto h-4 w-14 animate-pulse rounded bg-gray-100" />
        <p className="mt-0.5 text-gray-400 text-xs">1Y</p>
      </div>
    );
  }

  if (pctChange === null) {
    return (
      <div className="hidden w-20 shrink-0 text-right sm:block">
        <p className="text-gray-400 text-xs">&mdash;</p>
        <p className="text-gray-400 text-xs">1Y</p>
      </div>
    );
  }

  const isPositive = pctChange >= 0;

  return (
    <div className="hidden w-20 shrink-0 text-right sm:block">
      <p
        className={`flex items-center justify-end gap-1 font-medium text-sm tabular-nums ${isPositive ? "text-emerald-600" : "text-red-500"}`}
      >
        {isPositive ? (
          <TrendingUp className="h-3.5 w-3.5" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5" />
        )}
        {isPositive ? "+" : ""}
        {pctChange.toFixed(1)}%
      </p>
      <p className="text-gray-400 text-xs">1Y</p>
    </div>
  );
}

function ETFRow({
  etf,
  isExpanded,
  onToggle,
  isLast,
}: {
  etf: ETF;
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  return (
    <motion.div
      className={isLast || isExpanded ? "" : "border-gray-100 border-b"}
      variants={{
        hidden: { opacity: 0, x: -12 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { type: "spring", stiffness: 300, damping: 24 },
        },
      }}
    >
      <button
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50/80"
        onClick={onToggle}
        type="button"
      >
        {/* Symbol badge */}
        <span className="inline-flex w-16 shrink-0 items-center justify-center rounded-md bg-primary/10 px-2.5 py-1 font-semibold text-primary text-xs">
          {etf.symbol}
        </span>

        {/* Name + Provider */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-gray-900 text-sm">
            {etf.name}
          </p>
          <p className="truncate text-gray-400 text-xs">
            {etf.provider}
            {etf.exchange && etf.exchange !== "Unknown" && (
              <span className="ml-1.5 text-gray-300">·</span>
            )}
            {etf.exchange && etf.exchange !== "Unknown" && (
              <span className="ml-1.5">
                {exchangeFlag(etf.exchange)} {etf.exchange}
              </span>
            )}
          </p>
        </div>

        {/* 1Y Performance */}
        <YearPerformance symbol={etf.symbol} />

        {/* MER */}
        <div className="hidden shrink-0 text-right sm:block">
          <p className="font-medium text-gray-900 text-sm tabular-nums">
            {etf.mer.toFixed(2)}%
          </p>
          <p className="text-gray-400 text-xs">MER</p>
        </div>

        {/* Country allocation bar (desktop) */}
        {etf.topCountries.length > 0 && (
          <div
            className="hidden shrink-0 lg:block"
            title={etf.topCountries
              .map((c) => `${c.country} ${c.allocation.toFixed(1)}%`)
              .join(", ")}
          >
            <div className="flex h-1.5 w-24 overflow-hidden rounded-full">
              {etf.topCountries.map((c, i) => (
                <div
                  className={`${COUNTRY_COLORS[i % COUNTRY_COLORS.length]}`}
                  key={c.country}
                  style={{ width: `${c.allocation}%` }}
                />
              ))}
              <div className="flex-1 bg-gray-100" />
            </div>
            <p className="mt-1 truncate text-[10px] text-gray-400">
              {etf.topCountries[0]?.country}
              {etf.topCountries.length > 1
                ? ` +${etf.topCountries.length - 1}`
                : ""}
            </p>
          </div>
        )}

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="shrink-0"
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            className="overflow-hidden"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <ExpandedContent etf={etf} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
