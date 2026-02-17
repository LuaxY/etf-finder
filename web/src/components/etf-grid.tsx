import { motion } from "framer-motion";
import { ETFCard } from "./etf-card";
import type { ETF } from "@/lib/types";

interface ETFGridProps {
	etfs: ETF[];
	summary: string;
	onSelect: (etf: ETF) => void;
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
	if (etfs.length === 0) return null;

	return (
		<div className="w-full max-w-6xl mx-auto mt-8">
			{summary && (
				<p className="text-sm text-muted-foreground mb-4 text-center max-w-3xl mx-auto">
					{summary}
				</p>
			)}
			<motion.div
				className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
				variants={container}
				initial="hidden"
				animate="show"
				key={etfs.map((e) => e.symbol).join(",")}
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
