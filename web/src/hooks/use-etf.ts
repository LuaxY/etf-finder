import { useMutation, useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { getETFHistory, getSuggestions, searchETFs } from "@/lib/api";
import type { Period } from "@/lib/types";

export function useSearchETFs() {
  return useMutation({
    mutationFn: (industry: string) => searchETFs(industry),
  });
}

export function useSuggestions(query: string) {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ["suggestions", debouncedQuery],
    queryFn: () => getSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}

export function useETFHistory(
  symbol: string | null,
  period: Period,
  from?: string,
  to?: string
) {
  return useQuery({
    queryKey: ["etf-history", symbol, period, from, to],
    queryFn: () => getETFHistory(symbol ?? "", period, from, to),
    enabled: !!symbol,
  });
}
