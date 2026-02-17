import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
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
		<div className="w-full max-w-2xl mx-auto">
			<form onSubmit={handleSubmit} className="flex gap-2">
				<Input
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search for ETFs by industry..."
					className="h-12 text-base rounded-xl"
					disabled={isLoading}
				/>
				<Button
					type="submit"
					size="lg"
					className="h-12 px-6 rounded-xl"
					disabled={isLoading || !query.trim()}
				>
					{isLoading ? (
						<Loader2 className="h-5 w-5 animate-spin" />
					) : (
						<Search className="h-5 w-5" />
					)}
				</Button>
			</form>
			<div className="flex flex-wrap gap-2 mt-3 justify-center">
				{EXAMPLES.map((example) => (
					<button
						key={example}
						type="button"
						onClick={() => {
							setQuery(example);
							onSearch(example);
						}}
						disabled={isLoading}
						className="px-3 py-1.5 text-sm rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
					>
						{example}
					</button>
				))}
			</div>
		</div>
	);
}
