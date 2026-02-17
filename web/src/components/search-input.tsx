import { Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSuggestions } from "@/hooks/use-etf";

const EXAMPLES = [
  "Clean Energy",
  "Semiconductors",
  "AI & Robotics",
  "Cybersecurity",
  "Healthcare",
];

interface SearchInputProps {
  isLoading: boolean;
  onSearch: (query: string) => void;
}

export function SearchInput({ onSearch, isLoading }: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = "suggestions-listbox";

  const { data } = useSuggestions(query);
  const suggestions = data?.suggestions ?? [];

  const showDropdown = isOpen && suggestions.length > 0 && !isLoading;

  // Reset selection when suggestions change
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset on suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  // Close on click outside
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const selectSuggestion = useCallback(
    (value: string) => {
      setQuery(value);
      setIsOpen(false);
      onSearch(value);
    },
    [onSearch]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) {
      return;
    }

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      }
      case "Enter": {
        if (selectedIndex >= 0) {
          e.preventDefault();
          selectSuggestion(suggestions[selectedIndex]);
        }
        break;
      }
      case "Escape": {
        e.preventDefault();
        setIsOpen(false);
        break;
      }
      default:
        break;
    }
  };

  const activeDescendant =
    selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined;

  return (
    <div className="mx-auto w-full max-w-2xl" ref={containerRef}>
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <form className="flex gap-2" onSubmit={handleSubmit}>
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              aria-activedescendant={activeDescendant}
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-expanded={showDropdown}
              className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pr-4 pl-10 text-gray-900 text-sm placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              disabled={isLoading}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search by industry or theme..."
              ref={inputRef}
              role="combobox"
              value={query}
            />

            {showDropdown && (
              <div
                className="absolute top-full right-0 left-0 z-50 mt-1 max-h-64 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                id={listboxId}
                role="listbox"
              >
                {suggestions.map((suggestion, index) => (
                  <div
                    aria-selected={index === selectedIndex}
                    className={`cursor-pointer px-3 py-2 text-sm ${
                      index === selectedIndex
                        ? "bg-accent text-primary"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    id={`suggestion-${index}`}
                    key={suggestion}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectSuggestion(suggestion);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    role="option"
                    tabIndex={-1}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button
            className="h-11 rounded-lg bg-primary px-5 font-medium hover:bg-primary/90"
            disabled={isLoading || !query.trim()}
            type="submit"
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
              className="rounded-full border border-gray-200 bg-white px-3 py-1 font-medium text-gray-600 text-xs transition-colors hover:border-primary/30 hover:bg-accent hover:text-primary disabled:opacity-50"
              disabled={isLoading}
              key={example}
              onClick={() => {
                setQuery(example);
                setIsOpen(false);
                onSearch(example);
              }}
              type="button"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
