import { Button } from "@/components/ui/button";
import type { Period } from "@/lib/types";

const PERIODS: Period[] = ["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y", "MAX"];

interface TimeHorizonProps {
	selected: Period;
	onChange: (period: Period) => void;
}

export function TimeHorizon({ selected, onChange }: TimeHorizonProps) {
	return (
		<div className="flex gap-1 flex-wrap">
			{PERIODS.map((period) => (
				<Button
					key={period}
					variant={selected === period ? "default" : "ghost"}
					size="sm"
					className="h-7 px-2.5 text-xs"
					onClick={() => onChange(period)}
				>
					{period}
				</Button>
			))}
		</div>
	);
}
