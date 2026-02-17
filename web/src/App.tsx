import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchInput } from "@/components/search-input";
import { ETFTable } from "@/components/etf-table";
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
		<div className="min-h-screen bg-gray-50/50">
			<div className="container mx-auto px-4 py-12">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold tracking-tight text-foreground">
						ETF Finder
					</h1>
					<p className="text-muted-foreground mt-2">
						Discover ETFs by industry using AI-powered recommendations
					</p>
				</div>

				<SearchInput onSearch={handleSearch} isLoading={search.isPending} />

				{search.isError && (
					<p className="text-center text-destructive mt-6 text-sm">
						Something went wrong. Please try again.
					</p>
				)}

				{search.data && (
					<ETFTable
						etfs={search.data.etfs}
						summary={search.data.summary}
					/>
				)}
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
