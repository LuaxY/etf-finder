import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ETF } from "@/lib/types";

interface ETFCardProps {
	etf: ETF;
	onClick: () => void;
}

export function ETFCard({ etf, onClick }: ETFCardProps) {
	return (
		<motion.div
			whileHover={{ scale: 1.02, y: -2 }}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
		>
			<Card
				className="cursor-pointer hover:shadow-md transition-shadow h-full"
				onClick={onClick}
			>
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<Badge variant="default" className="text-xs">
							{etf.symbol}
						</Badge>
						<span className="text-xs text-muted-foreground">
							{etf.provider}
						</span>
					</div>
					<CardTitle className="text-base mt-2 line-clamp-2">
						{etf.name}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground line-clamp-2 mb-3">
						{etf.description}
					</p>
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium">
							MER: {etf.mer.toFixed(2)}%
						</span>
					</div>
					{etf.topCountries.length > 0 && (
						<div className="flex flex-wrap gap-1 mt-2">
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
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}
