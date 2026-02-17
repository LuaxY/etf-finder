import type { Period } from "@/lib/types";

const PERIODS: Period[] = ["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y", "MAX"];

interface TimeHorizonProps {
	selected: Period;
	onChange: (period: Period) => void;
}

export function TimeHorizon({ selected, onChange }: TimeHorizonProps) {
	return (
		<div className="flex gap-0.5 rounded-lg bg-gray-100 p-0.5">
			{PERIODS.map((period) => (
				<button
					key={period}
					type="button"
					className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
						selected === period
							? "bg-white text-gray-900 shadow-sm"
							: "text-gray-500 hover:text-gray-700"
					}`}
					onClick={() => onChange(period)}
				>
					{period}
				</button>
			))}
		</div>
	);
}
