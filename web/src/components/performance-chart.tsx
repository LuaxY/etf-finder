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

	const color = isPositive ? "#16a34a" : "#dc2626";

	if (isLoading) {
		return <Skeleton className="w-full h-[250px] rounded-lg" />;
	}

	if (data.length === 0) {
		return (
			<div className="w-full h-[250px] flex items-center justify-center text-muted-foreground text-sm">
				No price data available
			</div>
		);
	}

	return (
		<ResponsiveContainer width="100%" height={250}>
			<AreaChart data={data}>
				<defs>
					<linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor={color} stopOpacity={0.3} />
						<stop offset="100%" stopColor={color} stopOpacity={0.02} />
					</linearGradient>
				</defs>
				<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
				<XAxis
					dataKey="date"
					tickFormatter={(val) => {
						try {
							return format(parseISO(val), "MMM d");
						} catch {
							return val;
						}
					}}
					tick={{ fontSize: 11 }}
					stroke="#9ca3af"
				/>
				<YAxis
					domain={["auto", "auto"]}
					tick={{ fontSize: 11 }}
					stroke="#9ca3af"
					tickFormatter={(val) => `$${val.toFixed(0)}`}
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
							<div className="bg-white border rounded-lg shadow-sm p-2 text-sm">
								<p className="text-muted-foreground">{dateLabel}</p>
								<p className="font-medium">${point.close.toFixed(2)}</p>
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
