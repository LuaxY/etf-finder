import { m } from "framer-motion";
import type { Period } from "@/lib/types";

const PERIODS: Period[] = ["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y", "MAX"];

interface TimeHorizonProps {
  onChange: (period: Period) => void;
  selected: Period;
}

export function TimeHorizon({ selected, onChange }: TimeHorizonProps) {
  return (
    <div className="flex w-fit gap-0.5 rounded-lg bg-gray-100 p-0.5">
      {PERIODS.map((period) => (
        <button
          className="relative rounded-md px-2 py-1 font-medium text-xs"
          key={period}
          onClick={() => onChange(period)}
          type="button"
        >
          {selected === period && (
            <m.div
              className="absolute inset-0 rounded-md bg-white shadow-sm"
              layoutId="time-horizon-active"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
          <span
            className={`relative z-10 transition-colors ${
              selected === period
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {period}
          </span>
        </button>
      ))}
    </div>
  );
}
