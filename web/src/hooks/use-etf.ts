import { useMutation, useQuery } from "@tanstack/react-query";
import { getETFHistory, searchETFs } from "@/lib/api";
import type { Period } from "@/lib/types";

export function useSearchETFs() {
	return useMutation({
		mutationFn: (industry: string) => searchETFs(industry),
	});
}

export function useETFHistory(
	symbol: string | null,
	period: Period,
	from?: string,
	to?: string,
) {
	return useQuery({
		queryKey: ["etf-history", symbol, period, from, to],
		queryFn: () => getETFHistory(symbol!, period, from, to),
		enabled: !!symbol,
	});
}
