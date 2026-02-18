import { useMutation, useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { useCallback, useRef } from "react";
import { track } from "@/lib/analytics";
import { getETFHistory, getSuggestions, searchETFs } from "@/lib/api";
import type { Period } from "@/lib/types";

export function useSearchETFs() {
  const abortRef = useRef<AbortController | null>(null);

  const mutation = useMutation({
    mutationFn: (industry: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      return searchETFs(industry, controller.signal);
    },
    onSuccess: (data, industry) => {
      track("search_completed", {
        query: industry,
        etf_count: data.etfs.length,
        has_summary: !!data.summary,
      });
    },
    onError: (error, industry) => {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      track("search_failed", {
        query: industry,
        error_message: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    mutation.reset();
  }, [mutation]);

  return { ...mutation, cancel };
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
