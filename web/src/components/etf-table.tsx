import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ExternalLink, Globe, Info, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { TimeHorizon } from "./time-horizon";
import { PerformanceChart } from "./performance-chart";
import { useETFHistory } from "@/hooks/use-etf";
import type { ETF, Period } from "@/lib/types";

interface ETFTableProps {
	etfs: ETF[];
	summary: string;
}

function ExpandedContent({ etf }: { etf: ETF }) {
	const [period, setPeriod] = useState<Period>("1Y");
	const { data, isLoading } = useETFHistory(etf.symbol, period);

	return (
		<div className="border-t border-gray-100 bg-gray-50/50 px-6 py-5">
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
				{/* Details */}
				<div className="space-y-4">
					<div>
						<p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
							<Info className="h-3 w-3" />
							About
						</p>
						<p className="text-sm leading-relaxed text-gray-600">
							{etf.description}
						</p>
					</div>

					{etf.topCountries.length > 0 && (
						<div>
							<p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
								<Globe className="h-3 w-3" />
								Geographic Exposure
							</p>
							<div className="space-y-2">
								{etf.topCountries.map((c) => (
									<div
										key={c.country}
										className="flex items-center justify-between text-sm"
									>
										<span className="text-gray-700">{c.country}</span>
										<div className="flex items-center gap-2">
											<div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200">
												<div
													className="h-full rounded-full bg-primary"
													style={{
														width: `${Math.min(c.allocation, 100)}%`,
													}}
												/>
											</div>
											<span className="w-12 text-right tabular-nums text-xs text-gray-500">
												{c.allocation.toFixed(1)}%
											</span>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{etf.productUrl && (
						<a
							href={etf.productUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-primary/30 hover:text-primary"
						>
							Product Page
							<ExternalLink className="h-3 w-3" />
						</a>
					)}
				</div>

				{/* Chart */}
				<div>
					<div className="mb-3 flex items-center justify-between">
						<p className="text-sm font-medium text-gray-700">Performance</p>
						<TimeHorizon selected={period} onChange={setPeriod} />
					</div>
					<div className="rounded-lg border border-gray-200 bg-white p-4">
						<PerformanceChart
							data={data?.prices ?? []}
							isLoading={isLoading}
						/>
					</div>
				</div>
			</div>
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
			<p className={`flex items-center justify-end gap-1 tabular-nums text-sm font-medium ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
				{isPositive ? (
					<TrendingUp className="h-3.5 w-3.5" />
				) : (
					<TrendingDown className="h-3.5 w-3.5" />
				)}
				{isPositive ? "+" : ""}{pctChange.toFixed(1)}%
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
}: { etf: ETF; isExpanded: boolean; onToggle: () => void; isLast: boolean }) {
	return (
		<div className={!isLast && !isExpanded ? "border-b border-gray-100" : ""}>
			<button
				type="button"
				onClick={onToggle}
				className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50/80"
			>
				{/* Symbol badge */}
				<span className="inline-flex shrink-0 items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
					{etf.symbol}
				</span>

				{/* Name + Provider */}
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium text-gray-900">
						{etf.name}
					</p>
					<p className="truncate text-xs text-gray-400">{etf.provider}</p>
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

				{/* Top countries (desktop) */}
				<div className="hidden shrink-0 items-center gap-1.5 lg:flex">
					{etf.topCountries.slice(0, 2).map((c) => (
						<span
							key={c.country}
							className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
						>
							{c.country}
						</span>
					))}
				</div>

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
