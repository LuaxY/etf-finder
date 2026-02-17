import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
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
  onCancel?: () => void;
  onSearch: (query: string) => void;
}

export function SearchInput({
  onSearch,
  onCancel,
  isLoading,
}: SearchInputProps) {
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
    <div className="w-full" ref={containerRef}>
      <form className="flex gap-3" onSubmit={handleSubmit}>
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-teal-400/60" />
          <input
            aria-activedescendant={activeDescendant}
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-expanded={showDropdown}
            className="h-[52px] w-full rounded-lg border border-white/10 bg-white/[0.97] pr-4 pl-8 text-gray-900 shadow-lg shadow-teal-950/20 backdrop-blur-sm placeholder:text-gray-400 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
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

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute top-full right-0 left-0 z-50 mt-2 max-h-64 overflow-auto rounded-lg border border-gray-100 bg-white py-1 shadow-teal-950/10 shadow-xl"
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                id={listboxId}
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                role="listbox"
                style={{ transformOrigin: "top" }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              >
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    animate={{ opacity: 1, x: 0 }}
                    aria-selected={index === selectedIndex}
                    className={`cursor-pointer px-4 py-2.5 text-sm ${
                      index === selectedIndex
                        ? "bg-accent text-primary"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    id={`suggestion-${index}`}
                    initial={{ opacity: 0, x: -8 }}
                    key={suggestion}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectSuggestion(suggestion);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    role="option"
                    tabIndex={-1}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                  >
                    {suggestion}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {isLoading ? (
          <Button
            className="h-[52px] w-[100px] rounded-lg border border-red-400/30 bg-red-500/20 text-red-400 backdrop-blur-sm transition-all hover:border-red-400/50 hover:bg-red-500/30 hover:text-red-300"
            onClick={onCancel}
            type="button"
          >
            <X className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            className="h-[52px] w-[100px] rounded-lg border border-teal-600/30 bg-gradient-to-b from-teal-500 to-teal-600 font-semibold text-teal-50 shadow-[0_2px_10px_rgba(13,148,136,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all hover:from-teal-400 hover:to-teal-500 hover:shadow-[0_2px_12px_rgba(13,148,136,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] disabled:opacity-40 disabled:shadow-none"
            disabled={!query.trim()}
            type="submit"
          >
            Search
          </Button>
        )}
      </form>

      <motion.div
        animate="visible"
        className="mt-4 flex flex-wrap items-center gap-2"
        initial="hidden"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.05, delayChildren: 0.2 },
          },
        }}
      >
        {EXAMPLES.map((example) => (
          <motion.button
            className="rounded-full border border-teal-400/15 bg-teal-400/10 px-3.5 py-1.5 font-medium text-teal-200/90 text-xs backdrop-blur-sm transition-all hover:border-teal-400/30 hover:bg-teal-400/20 hover:text-white disabled:opacity-50"
            disabled={isLoading}
            key={example}
            onClick={() => {
              setQuery(example);
              setIsOpen(false);
              onSearch(example);
            }}
            type="button"
            variants={{
              hidden: { opacity: 0, scale: 0.92 },
              visible: { opacity: 1, scale: 1 },
            }}
          >
            {example}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
