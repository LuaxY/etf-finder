import { useMemo, useRef } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Period, PricePoint } from "@/lib/types";

interface PerformanceChartProps {
	data: PricePoint[];
	isLoading: boolean;
	period: Period;
}

function getTickFormatter(period: Period) {
	const isIntraday = period === "1D";
	const isShortRange = period === "5D";
	const isLongRange = period === "5Y" || period === "MAX";

	return (val: string) => {
		try {
			const d = parseISO(val);
			if (isIntraday) return format(d, "HH:mm");
			if (isShortRange) return format(d, "EEE d");
			if (isLongRange) return format(d, "MMM yyyy");
			return format(d, "MMM d");
		} catch {
			return val;
		}
	};
}

function getTooltipFormat(period: Period) {
	return (val: string) => {
		try {
			const d = parseISO(val);
			if (period === "1D" || period === "5D")
				return format(d, "MMM d, yyyy HH:mm");
			return format(d, "MMM d, yyyy");
		} catch {
			return val;
		}
	};
}

function deduplicateTicks(data: PricePoint[], formatter: (val: string) => string, maxTicks: number) {
	if (data.length <= maxTicks) {
		// Even with few data points, deduplicate labels
		const seen = new Set<string>();
		const indices: number[] = [];
		for (let i = 0; i < data.length; i++) {
			const label = formatter(data[i].date);
			if (!seen.has(label)) {
				seen.add(label);
				indices.push(i);
			}
		}
		return indices.map((i) => data[i].date);
	}

	// Pick evenly spaced candidates, then deduplicate labels
	const step = (data.length - 1) / (maxTicks - 1);
	const candidates: number[] = [];
	for (let i = 0; i < maxTicks; i++) {
		candidates.push(Math.round(i * step));
	}

	const seen = new Set<string>();
	const ticks: string[] = [];
	for (const idx of candidates) {
		const label = formatter(data[idx].date);
		if (!seen.has(label)) {
			seen.add(label);
			ticks.push(data[idx].date);
		}
	}
	return ticks;
}

export function PerformanceChart({ data, isLoading, period }: PerformanceChartProps) {
	const prevDataRef = useRef<PricePoint[]>([]);

	// Use previous data while loading so the chart stays visible
	const chartData = isLoading && data.length === 0 ? prevDataRef.current : data;

	// Update ref when we get real data
	if (!isLoading && data.length > 0) {
		prevDataRef.current = data;
	}

	const isPositive = useMemo(() => {
		if (chartData.length < 2) return true;
		return chartData[chartData.length - 1].close >= chartData[0].close;
	}, [chartData]);

	const color = isPositive ? "#0f766e" : "#dc2626";

	const tickFormatter = useMemo(() => getTickFormatter(period), [period]);
	const tooltipFormatter = useMemo(() => getTooltipFormat(period), [period]);
	const ticks = useMemo(
		() => deduplicateTicks(chartData, tickFormatter, 6),
		[chartData, tickFormatter],
	);

	if (chartData.length === 0 && !isLoading) {
		return (
			<div className="flex h-[220px] w-full items-center justify-center text-sm text-gray-400">
				No price data available
			</div>
		);
	}

	if (chartData.length === 0 && isLoading) {
		return (
			<div className="flex h-[220px] w-full items-center justify-center">
				<Loader2 className="h-5 w-5 animate-spin text-gray-300" />
			</div>
		);
	}

	return (
		<div className="relative">
			{isLoading && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
					<Loader2 className="h-5 w-5 animate-spin text-gray-400" />
				</div>
			)}
			<ResponsiveContainer width="100%" height={220}>
				<AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
					<defs>
						<linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor={color} stopOpacity={0.2} />
							<stop offset="100%" stopColor={color} stopOpacity={0.02} />
						</linearGradient>
					</defs>
					<CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
					<XAxis
						dataKey="date"
						ticks={ticks}
						tickFormatter={tickFormatter}
						tick={{ fontSize: 11, fill: "#9ca3af" }}
						stroke="#e5e7eb"
						tickLine={false}
						axisLine={false}
					/>
					<YAxis
						domain={["auto", "auto"]}
						tick={{ fontSize: 11, fill: "#9ca3af" }}
						stroke="#e5e7eb"
						tickFormatter={(val) => `$${val.toFixed(0)}`}
						tickLine={false}
						axisLine={false}
						mirror
						dx={4}
					/>
					<Tooltip
						content={({ active, payload }) => {
							if (!active || !payload?.length) return null;
							const point = payload[0].payload as PricePoint;
							const dateLabel = tooltipFormatter(point.date);
							return (
								<div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
									<p className="text-xs text-gray-400">{dateLabel}</p>
									<p className="font-medium tabular-nums text-gray-900">
										${point.close.toFixed(2)}
									</p>
								</div>
							);
						}}
					/>
					<Area
						type="monotone"
						dataKey="close"
						stroke={color}
						strokeWidth={2}
						fill="url(#priceGradient)"
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
