import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { ETFTable } from "@/components/etf-table";
import { SearchInput } from "@/components/search-input";
import { SearchLoading } from "@/components/search-loading";
import { useSearchETFs } from "@/hooks/use-etf";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function AppContent() {
  const search = useSearchETFs();

  const handleSearch = (query: string) => {
    search.mutate(query);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <TrendingUp className="h-7 w-7 text-white" />
          </div>
          <h1 className="mb-3 font-semibold font-serif text-3xl text-gray-900">
            ETF Finder
          </h1>
          <p className="text-gray-500 leading-relaxed">
            Discover ETFs by industry using AI-powered recommendations
          </p>
        </div>

        {/* Search */}
        <SearchInput isLoading={search.isPending} onSearch={handleSearch} />

        {/* Error */}
        {search.isError && (
          <div className="mx-auto mt-6 max-w-2xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center">
            <p className="text-red-600 text-sm">
              Something went wrong. Please try again.
            </p>
          </div>
        )}

        {/* Loading / Results */}
        <AnimatePresence mode="wait">
          {search.isPending && <SearchLoading key="loading" />}
          {!search.isPending && search.data && (
            <ETFTable
              etfs={search.data.etfs}
              key="results"
              summary={search.data.summary}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
