import { useState } from "react";
import { ExternalLink } from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TimeHorizon } from "./time-horizon";
import { PerformanceChart } from "./performance-chart";
import { useETFHistory } from "@/hooks/use-etf";
import type { ETF, Period } from "@/lib/types";

interface ETFDetailSheetProps {
	etf: ETF | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ETFDetailSheet({
	etf,
	open,
	onOpenChange,
}: ETFDetailSheetProps) {
	const [period, setPeriod] = useState<Period>("1Y");
	const { data, isLoading } = useETFHistory(
		open ? etf?.symbol ?? null : null,
		period,
	);

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-lg overflow-y-auto">
				{etf && (
					<>
						<SheetHeader>
							<div className="flex items-center gap-2">
								<Badge>{etf.symbol}</Badge>
								<span className="text-sm text-muted-foreground">
									{etf.provider}
								</span>
							</div>
							<SheetTitle className="text-xl">{etf.name}</SheetTitle>
							<SheetDescription>{etf.description}</SheetDescription>
						</SheetHeader>

						<div className="mt-6 space-y-6">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									Management Expense Ratio
								</span>
								<span className="font-semibold">
									{etf.mer.toFixed(2)}%
								</span>
							</div>

							{etf.topCountries.length > 0 && (
								<div>
									<p className="text-sm text-muted-foreground mb-2">
										Top Countries
									</p>
									<div className="flex flex-wrap gap-1.5">
										{etf.topCountries.map((c) => (
											<Badge
												key={c.country}
												variant="secondary"
												className="font-normal"
											>
												{c.country} ({c.allocation.toFixed(1)}%)
											</Badge>
										))}
									</div>
								</div>
							)}

							<div>
								<div className="flex items-center justify-between mb-3">
									<p className="text-sm font-medium">Performance</p>
									<TimeHorizon selected={period} onChange={setPeriod} />
								</div>
								<PerformanceChart
									data={data?.prices ?? []}
									isLoading={isLoading}
									period={period}
								/>
							</div>

							{etf.productUrl && (
								<Button variant="outline" className="w-full" asChild>
									<a
										href={etf.productUrl}
										target="_blank"
										rel="noopener noreferrer"
									>
										View Product Page
										<ExternalLink className="ml-2 h-4 w-4" />
									</a>
								</Button>
							)}
						</div>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}
