import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BrainCircuit,
  Building2,
  Cpu,
  Factory,
  Globe,
  Heart,
  Landmark,
  Leaf,
  Search,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";
import { ETFTable } from "@/components/etf-table";
import { SearchInput } from "@/components/search-input";
import { SearchLoading } from "@/components/search-loading";
import { useSearchETFs } from "@/hooks/use-etf";

const STEPS = [
  {
    icon: Search,
    title: "Search a theme",
    description: "Enter any industry, sector, or investment theme",
  },
  {
    icon: BrainCircuit,
    title: "Get AI picks",
    description: "AI analyzes and selects the most relevant ETFs",
  },
  {
    icon: BarChart3,
    title: "Explore data",
    description: "View performance charts and country allocations",
  },
];

const SECTORS = [
  { label: "Technology", icon: Cpu, query: "Technology" },
  { label: "Healthcare", icon: Heart, query: "Healthcare" },
  { label: "Clean Energy", icon: Leaf, query: "Clean Energy" },
  { label: "Semiconductors", icon: Zap, query: "Semiconductors" },
  { label: "Real Estate", icon: Building2, query: "Real Estate" },
  { label: "Cybersecurity", icon: ShieldCheck, query: "Cybersecurity" },
  { label: "Emerging Markets", icon: Globe, query: "Emerging Markets" },
  { label: "Industrials", icon: Factory, query: "Industrials" },
  { label: "Financials", icon: Landmark, query: "Financials" },
];

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
    <div className="flex min-h-screen flex-col">
      {/* Hero Header */}
      <header className="relative bg-gradient-to-br from-teal-950 via-teal-900 to-teal-800">
        {/* Decorative background (overflow-hidden to contain glows) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="header-dots absolute inset-0" />
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-teal-600/15 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 pt-12 pb-10">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <button
              className="group mb-2 flex cursor-pointer items-center gap-2.5"
              onClick={() => search.reset()}
              type="button"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded bg-teal-400/20">
                <TrendingUp className="h-3 w-3 text-teal-400" strokeWidth={2.5} />
              </div>
              <span className="font-medium text-[0.7rem] text-teal-400/80 uppercase tracking-[0.2em] transition-colors group-hover:text-teal-300">
                AI-powered discovery
              </span>
            </button>
            <h1
              className="cursor-pointer font-bold font-serif text-[2.2rem] text-white leading-tight tracking-tight"
              onClick={() => search.reset()}
            >
              ETF Finder
            </h1>
            <p className="mt-2 max-w-md text-[0.9rem] text-teal-300/50 leading-relaxed">
              Search any sector or theme and get instant ETF recommendations
              backed by real-time market data.
            </p>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
            initial={{ opacity: 0, y: 12 }}
            transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
          >
            <SearchInput
              isLoading={search.isPending}
              onCancel={search.cancel}
              onSearch={handleSearch}
            />
          </motion.div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Error */}
        <AnimatePresence>
          {search.isError && (
            <motion.div
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center"
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <p className="text-red-600 text-sm">
                Something went wrong. Please try again.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading / Results */}
        <AnimatePresence mode="wait">
          {search.isPending && <SearchLoading key="loading" />}
          {!search.isPending && search.data && (
            <ETFTable
              etfs={search.data.etfs}
              key={`results-${search.submittedAt}`}
              summary={search.data.summary}
            />
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!(search.isPending || search.data || search.isError) && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 16 }}
            transition={{ delay: 0.25, duration: 0.45, ease: "easeOut" }}
          >
            {/* How it works */}
            <div className="mb-10">
              <h2 className="mb-5 font-semibold font-serif text-gray-900 text-lg">
                How it works
              </h2>
              <motion.div
                animate="visible"
                className="grid grid-cols-3 gap-4"
                initial="hidden"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.1 } },
                }}
              >
                {STEPS.map((step, i) => (
                  <motion.div
                    className="rounded-lg border border-gray-150 bg-white p-5"
                    key={step.title}
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 24,
                        },
                      },
                    }}
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-primary">
                        <step.icon className="h-[18px] w-[18px]" />
                      </div>
                      <span className="font-mono text-gray-300 text-xs">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mb-1 font-semibold text-gray-900 text-sm">
                      {step.title}
                    </h3>
                    <p className="text-[0.8rem] text-gray-500 leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Popular sectors */}
            <div>
              <h2 className="mb-5 font-semibold font-serif text-gray-900 text-lg">
                Popular sectors
              </h2>
              <motion.div
                animate="visible"
                className="grid grid-cols-3 gap-3"
                initial="hidden"
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: 0.04, delayChildren: 0.2 },
                  },
                }}
              >
                {SECTORS.map((sector) => (
                  <motion.button
                    className="group flex items-center gap-3 rounded-lg border border-gray-150 bg-white px-4 py-3.5 text-left transition-all hover:border-primary/20 hover:shadow-sm"
                    key={sector.label}
                    onClick={() => handleSearch(sector.query)}
                    type="button"
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 24,
                        },
                      },
                    }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-50 text-gray-400 transition-colors group-hover:bg-teal-50 group-hover:text-primary">
                      <sector.icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-gray-700 text-sm transition-colors group-hover:text-gray-900">
                      {sector.label}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      <p className="mt-auto py-6 text-center text-[0.7rem] text-gray-400 leading-relaxed">
        For informational purposes only — not financial advice.
        Always do your own research before making investment decisions.
      </p>
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
