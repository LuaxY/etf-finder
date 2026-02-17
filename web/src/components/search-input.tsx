import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXAMPLES = [
	"Clean Energy",
	"Semiconductors",
	"AI & Robotics",
	"Cybersecurity",
	"Healthcare",
];

interface SearchInputProps {
	onSearch: (query: string) => void;
	isLoading: boolean;
}

export function SearchInput({ onSearch, isLoading }: SearchInputProps) {
	const [query, setQuery] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (query.trim()) onSearch(query.trim());
	};

	return (
		<div className="mx-auto w-full max-w-2xl">
			<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
				<form onSubmit={handleSubmit} className="flex gap-2">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
						<input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search by industry or theme..."
							className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
							disabled={isLoading}
						/>
					</div>
					<Button
						type="submit"
						className="h-11 rounded-lg bg-primary px-5 font-medium hover:bg-primary/90"
						disabled={isLoading || !query.trim()}
					>
						{isLoading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							"Search"
						)}
					</Button>
				</form>

				<div className="mt-3 flex flex-wrap gap-2">
					{EXAMPLES.map((example) => (
						<button
							key={example}
							type="button"
							onClick={() => {
								setQuery(example);
								onSearch(example);
							}}
							disabled={isLoading}
							className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-primary/30 hover:bg-accent hover:text-primary disabled:opacity-50"
						>
							{example}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
