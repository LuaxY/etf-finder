import type { Period } from "@/lib/types";

const PERIODS: Period[] = ["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y", "MAX"];

interface TimeHorizonProps {
  onChange: (period: Period) => void;
  selected: Period;
}

export function TimeHorizon({ selected, onChange }: TimeHorizonProps) {
  return (
    <div className="flex gap-0.5 rounded-lg bg-gray-100 p-0.5">
      {PERIODS.map((period) => (
        <button
          className={`rounded-md px-2 py-1 font-medium text-xs transition-colors ${
            selected === period
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
          key={period}
          onClick={() => onChange(period)}
          type="button"
        >
          {period}
        </button>
      ))}
    </div>
  );
}
