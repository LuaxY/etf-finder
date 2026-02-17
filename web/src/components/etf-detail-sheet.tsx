import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useETFHistory } from "@/hooks/use-etf";
import type { ETF, Period } from "@/lib/types";
import { PerformanceChart } from "./performance-chart";
import { TimeHorizon } from "./time-horizon";

interface ETFDetailSheetProps {
  etf: ETF | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function ETFDetailSheet({
  etf,
  open,
  onOpenChange,
}: ETFDetailSheetProps) {
  const [period, setPeriod] = useState<Period>("1Y");
  const { data, isLoading } = useETFHistory(
    open ? (etf?.symbol ?? null) : null,
    period
  );

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        {etf && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <Badge>{etf.symbol}</Badge>
                <span className="text-muted-foreground text-sm">
                  {etf.provider}
                </span>
              </div>
              <SheetTitle className="text-xl">{etf.name}</SheetTitle>
              <SheetDescription>{etf.description}</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Management Expense Ratio
                </span>
                <span className="font-semibold">{etf.mer.toFixed(2)}%</span>
              </div>

              {etf.topCountries.length > 0 && (
                <div>
                  <p className="mb-2 text-muted-foreground text-sm">
                    Top Countries
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {etf.topCountries.map((c) => (
                      <Badge
                        className="font-normal"
                        key={c.country}
                        variant="secondary"
                      >
                        {c.country} ({c.allocation.toFixed(1)}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-medium text-sm">Performance</p>
                  <TimeHorizon onChange={setPeriod} selected={period} />
                </div>
                <PerformanceChart
                  data={data?.prices ?? []}
                  isLoading={isLoading}
                  period={period}
                />
              </div>

              {etf.productUrl && (
                <Button asChild className="w-full" variant="outline">
                  <a
                    href={etf.productUrl}
                    rel="noopener noreferrer"
                    target="_blank"
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
