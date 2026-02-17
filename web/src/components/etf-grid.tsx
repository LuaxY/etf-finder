import { motion } from "framer-motion";
import type { ETF } from "@/lib/types";
import { ETFCard } from "./etf-card";

interface ETFGridProps {
  etfs: ETF[];
  onSelect: (etf: ETF) => void;
  summary: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function ETFGrid({ etfs, summary, onSelect }: ETFGridProps) {
  if (etfs.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto mt-8 w-full max-w-6xl">
      {summary && (
        <p className="mx-auto mb-4 max-w-3xl text-center text-muted-foreground text-sm">
          {summary}
        </p>
      )}
      <motion.div
        animate="show"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        key={etfs.map((e) => e.symbol).join(",")}
        variants={container}
      >
        {etfs.map((etf) => (
          <motion.div key={etf.symbol} variants={item}>
            <ETFCard etf={etf} onClick={() => onSelect(etf)} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
