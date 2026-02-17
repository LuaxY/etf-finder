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
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <Card
        className="h-full cursor-pointer transition-shadow hover:shadow-md"
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge className="text-xs" variant="default">
              {etf.symbol}
            </Badge>
            <span className="text-muted-foreground text-xs">
              {etf.provider}
            </span>
          </div>
          <CardTitle className="mt-2 line-clamp-2 text-base">
            {etf.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 line-clamp-2 text-muted-foreground text-sm">
            {etf.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">
              MER: {etf.mer.toFixed(2)}%
            </span>
          </div>
          {etf.topCountries.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {etf.topCountries.slice(0, 3).map((c) => (
                <Badge
                  className="font-normal text-xs"
                  key={c.country}
                  variant="secondary"
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
