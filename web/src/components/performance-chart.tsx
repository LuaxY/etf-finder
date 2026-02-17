import { useMemo } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import type { PricePoint } from "@/lib/types";

interface PerformanceChartProps {
	data: PricePoint[];
	isLoading: boolean;
}

export function PerformanceChart({ data, isLoading }: PerformanceChartProps) {
	const isPositive = useMemo(() => {
		if (data.length < 2) return true;
		return data[data.length - 1].close >= data[0].close;
	}, [data]);

	const color = isPositive ? "#0f766e" : "#dc2626";

	if (isLoading) {
		return <Skeleton className="h-[220px] w-full rounded-lg" />;
	}

	if (data.length === 0) {
		return (
			<div className="flex h-[220px] w-full items-center justify-center text-sm text-gray-400">
				No price data available
			</div>
		);
	}

	return (
		<ResponsiveContainer width="100%" height={220}>
			<AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
				<defs>
					<linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor={color} stopOpacity={0.2} />
						<stop offset="100%" stopColor={color} stopOpacity={0.02} />
					</linearGradient>
				</defs>
				<CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
				<XAxis
					dataKey="date"
					tickFormatter={(val) => {
						try {
							return format(parseISO(val), "MMM d");
						} catch {
							return val;
						}
					}}
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
						let dateLabel: string;
						try {
							dateLabel = format(parseISO(point.date), "MMM d, yyyy");
						} catch {
							dateLabel = point.date;
						}
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
	);
}
