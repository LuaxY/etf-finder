import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ExternalLink } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
		<div className="px-6 py-5 bg-muted/30">
			<div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
				<div className="space-y-4">
					<div>
						<p className="text-sm text-muted-foreground mb-1">Description</p>
						<p className="text-sm leading-relaxed">{etf.description}</p>
					</div>

					{etf.topCountries.length > 0 && (
						<div>
							<p className="text-sm text-muted-foreground mb-2">
								Top Countries
							</p>
							<div className="space-y-1.5">
								{etf.topCountries.map((c) => (
									<div
										key={c.country}
										className="flex items-center justify-between text-sm"
									>
										<span>{c.country}</span>
										<div className="flex items-center gap-2">
											<div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
												<div
													className="h-full rounded-full bg-primary"
													style={{
														width: `${Math.min(c.allocation, 100)}%`,
													}}
												/>
											</div>
											<span className="text-muted-foreground w-12 text-right tabular-nums">
												{c.allocation.toFixed(1)}%
											</span>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{etf.productUrl && (
						<Button variant="outline" size="sm" asChild>
							<a
								href={etf.productUrl}
								target="_blank"
								rel="noopener noreferrer"
							>
								Product Page
								<ExternalLink className="ml-1.5 h-3.5 w-3.5" />
							</a>
						</Button>
					)}
				</div>

				<div>
					<div className="flex items-center justify-between mb-3">
						<p className="text-sm font-medium">Performance</p>
						<TimeHorizon selected={period} onChange={setPeriod} />
					</div>
					<PerformanceChart
						data={data?.prices ?? []}
						isLoading={isLoading}
					/>
				</div>
			</div>
		</div>
	);
}

const COL_COUNT = 6;

export function ETFTable({ etfs, summary }: ETFTableProps) {
	const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);

	if (etfs.length === 0) return null;

	const toggle = (symbol: string) => {
		setExpandedSymbol((prev) => (prev === symbol ? null : symbol));
	};

	return (
		<div className="w-full max-w-6xl mx-auto mt-8">
			{summary && (
				<p className="text-sm text-muted-foreground mb-4 text-center max-w-3xl mx-auto">
					{summary}
				</p>
			)}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="rounded-xl border bg-card shadow-sm overflow-hidden"
			>
				<Table>
					<TableHeader>
						<TableRow className="hover:bg-transparent">
							<TableHead className="w-[100px]">Symbol</TableHead>
							<TableHead>Name</TableHead>
							<TableHead className="hidden md:table-cell">Provider</TableHead>
							<TableHead className="text-right">MER</TableHead>
							<TableHead className="hidden lg:table-cell">
								Top Countries
							</TableHead>
							<TableHead className="w-[40px]" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{etfs.map((etf) => {
							const isExpanded = expandedSymbol === etf.symbol;
							return (
								<ETFRow
									key={etf.symbol}
									etf={etf}
									isExpanded={isExpanded}
									onToggle={() => toggle(etf.symbol)}
								/>
							);
						})}
					</TableBody>
				</Table>
			</motion.div>
		</div>
	);
}

function ETFRow({
	etf,
	isExpanded,
	onToggle,
}: { etf: ETF; isExpanded: boolean; onToggle: () => void }) {
	return (
		<>
			<TableRow
				className="cursor-pointer"
				onClick={onToggle}
			>
				<TableCell>
					<Badge variant="default" className="text-xs">
						{etf.symbol}
					</Badge>
				</TableCell>
				<TableCell className="font-medium">{etf.name}</TableCell>
				<TableCell className="hidden md:table-cell text-muted-foreground">
					{etf.provider}
				</TableCell>
				<TableCell className="text-right tabular-nums">
					{etf.mer.toFixed(2)}%
				</TableCell>
				<TableCell className="hidden lg:table-cell">
					<div className="flex gap-1">
						{etf.topCountries.slice(0, 3).map((c) => (
							<Badge
								key={c.country}
								variant="secondary"
								className="text-xs font-normal"
							>
								{c.country}
							</Badge>
						))}
					</div>
				</TableCell>
				<TableCell>
					<motion.div
						animate={{ rotate: isExpanded ? 180 : 0 }}
						transition={{ duration: 0.2 }}
					>
						<ChevronDown className="h-4 w-4 text-muted-foreground" />
					</motion.div>
				</TableCell>
			</TableRow>
			<AnimatePresence>
				{isExpanded && (
					<tr>
						<td colSpan={COL_COUNT} className="p-0 border-b">
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: "auto", opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
								className="overflow-hidden"
							>
								<ExpandedContent etf={etf} />
							</motion.div>
						</td>
					</tr>
				)}
			</AnimatePresence>
		</>
	);
}
