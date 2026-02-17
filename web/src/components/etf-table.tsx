import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
	ChevronDown,
	ExternalLink,
	Sparkles,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import NumberFlow from "@number-flow/react";
import Markdown from "react-markdown";
import { TimeHorizon } from "./time-horizon";
import { PerformanceChart } from "./performance-chart";
import { useETFHistory } from "@/hooks/use-etf";
import type { ETF, Period } from "@/lib/types";

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
		<div className="border-t border-gray-100 bg-gray-50/50 px-6 py-5 space-y-5">
			{/* Top row: About (left) + Countries (right) */}
			<div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
				{/* About */}
				<div className="rounded-lg border border-gray-200 bg-white p-4">
					<p className="text-sm leading-relaxed text-gray-600">
						{etf.description}
					</p>
					{etf.productUrl && (
						<a
							href={etf.productUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
						>
							Visit product page
							<ExternalLink className="h-3 w-3" />
						</a>
					)}
				</div>

				{/* Geographic Exposure */}
				{etf.topCountries.length > 0 && (
					<div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2.5">
						{etf.topCountries.map((c) => {
							const maxAllocation = Math.max(
								...etf.topCountries.map((x) => x.allocation),
							);
							const barWidth = (c.allocation / maxAllocation) * 100;
							return (
								<div key={c.country} className="flex items-center gap-3">
									<span className="shrink-0 text-base leading-none">
										{countryFlag(c.country)}
									</span>
									<span className="w-24 shrink-0 truncate text-xs text-gray-600">
										{c.country}
									</span>
									<div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
										<div
											className="absolute inset-y-0 left-0 rounded-full bg-primary/60"
											style={{ width: `${barWidth}%` }}
										/>
									</div>
									<span className="w-12 shrink-0 text-right tabular-nums text-xs font-medium text-gray-500">
										{c.allocation.toFixed(1)}%
									</span>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Chart — full width below */}
			<div>
				<div className="mb-3 flex items-center justify-between">
					<PriceStats
						currentPrice={etf.currentPrice}
						currency={etf.currency}
						prices={data?.prices ?? []}
						isLoading={isLoading}
					/>
					<TimeHorizon selected={period} onChange={setPeriod} />
				</div>
				<div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
					<PerformanceChart data={data?.prices ?? []} isLoading={isLoading} period={period} />
				</div>
			</div>
		</div>
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
		if (!prices || prices.length < 2) return prevRef.current;
		const first = prices[0].close;
		const last = prices[prices.length - 1].close;
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
		[currency],
	);
	const pctFormat = useMemo(
		() => ({
			style: "percent" as const,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
			signDisplay: "always" as const,
		}),
		[],
	);
	const diffFormat = useMemo(
		() => ({
			style: "currency" as const,
			currency,
			signDisplay: "always" as const,
		}),
		[currency],
	);

	return (
		<div className="flex items-baseline gap-2.5">
			<NumberFlow
				value={currentPrice}
				format={currencyFormat}
				className="text-lg font-semibold text-gray-900 tabular-nums"
			/>
			{hasData && (
				<>
					<NumberFlow
						value={priceDiff}
						format={diffFormat}
						className={`text-sm font-medium tabular-nums ${color}`}
					/>
					<div
						className={`flex items-center gap-0.5 text-sm font-medium ${color}`}
					>
						{isPositive ? (
							<TrendingUp className="h-3.5 w-3.5" />
						) : (
							<TrendingDown className="h-3.5 w-3.5" />
						)}
						<NumberFlow
							value={pctChange / 100}
							format={pctFormat}
							className="tabular-nums"
						/>
					</div>
				</>
			)}
		</div>
	);
}

export function ETFTable({ etfs, summary }: ETFTableProps) {
	const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);

	if (etfs.length === 0) return null;

	const toggle = (symbol: string) => {
		setExpandedSymbol((prev) => (prev === symbol ? null : symbol));
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -8 }}
			transition={{ duration: 0.3 }}
			className="mx-auto mt-8 w-full max-w-4xl"
		>
			{summary && (
				<div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
					<div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
						<Sparkles className="h-3.5 w-3.5" />
						AI Summary
					</div>
					<div className="prose prose-sm prose-gray max-w-none text-gray-600 prose-p:leading-relaxed prose-strong:text-gray-900 prose-ul:my-1 prose-li:my-0.5 prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:text-sm prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
						<Markdown>{summary}</Markdown>
					</div>
				</div>
			)}
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
				className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
			>
				{etfs.map((etf, i) => {
					const isExpanded = expandedSymbol === etf.symbol;
					return (
						<ETFRow
							key={etf.symbol}
							etf={etf}
							isExpanded={isExpanded}
							onToggle={() => toggle(etf.symbol)}
							isLast={i === etfs.length - 1}
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
		if (!data?.prices || data.prices.length < 2) return null;
		const first = data.prices[0].close;
		const last = data.prices[data.prices.length - 1].close;
		return ((last - first) / first) * 100;
	}, [data]);

	if (isLoading) {
		return (
			<div className="hidden shrink-0 text-right sm:block w-20">
				<div className="h-4 w-14 ml-auto animate-pulse rounded bg-gray-100" />
				<p className="text-xs text-gray-400 mt-0.5">1Y</p>
			</div>
		);
	}

	if (pctChange === null) {
		return (
			<div className="hidden shrink-0 text-right sm:block w-20">
				<p className="text-xs text-gray-400">&mdash;</p>
				<p className="text-xs text-gray-400">1Y</p>
			</div>
		);
	}

	const isPositive = pctChange >= 0;

	return (
		<div className="hidden shrink-0 text-right sm:block w-20">
			<p
				className={`flex items-center justify-end gap-1 tabular-nums text-sm font-medium ${isPositive ? "text-emerald-600" : "text-red-500"}`}
			>
				{isPositive ? (
					<TrendingUp className="h-3.5 w-3.5" />
				) : (
					<TrendingDown className="h-3.5 w-3.5" />
				)}
				{isPositive ? "+" : ""}
				{pctChange.toFixed(1)}%
			</p>
			<p className="text-xs text-gray-400">1Y</p>
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
		<div className={!isLast && !isExpanded ? "border-b border-gray-100" : ""}>
			<button
				type="button"
				onClick={onToggle}
				className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50/80"
			>
				{/* Symbol badge */}
				<span className="inline-flex w-16 shrink-0 items-center justify-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
					{etf.symbol}
				</span>

				{/* Name + Provider */}
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium text-gray-900">
						{etf.name}
					</p>
					<p className="truncate text-xs text-gray-400">
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
					<p className="tabular-nums text-sm font-medium text-gray-900">
						{etf.mer.toFixed(2)}%
					</p>
					<p className="text-xs text-gray-400">MER</p>
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
									key={c.country}
									className={`${COUNTRY_COLORS[i % COUNTRY_COLORS.length]}`}
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
					transition={{ duration: 0.2 }}
					className="shrink-0"
				>
					<ChevronDown className="h-4 w-4 text-gray-400" />
				</motion.div>
			</button>

			<AnimatePresence>
				{isExpanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
						className="overflow-hidden"
					>
						<ExpandedContent etf={etf} />
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
