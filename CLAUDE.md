# ETF Recommendation

AI-powered ETF discovery tool. Search by industry, get recommendations from Claude, view historical performance charts.

## Tech Stack

- **Runtime**: Bun (workspaces: `api/`, `web/`)
- **Backend**: Elysia + Mastra workflow + Vercel AI SDK + yahoo-finance2
- **Frontend**: Vite + React 19 + TanStack Query + Tailwind CSS + shadcn/ui + Recharts + Framer Motion
- **AI**: OpenRouter → Claude (via `@ai-sdk/openai` with custom baseURL)
- **No database** — stateless with in-memory cache

## Project Structure

```
api/
  src/
    index.ts                    # Elysia server (port 3001, CORS)
    routes/etf.ts               # GET /api/etfs/suggestions, POST /api/etfs/search, GET /api/etfs/:symbol/history
    mastra/
      index.ts                  # Mastra instance
      workflows/etf-search.ts   # Two-step workflow: AI picks symbols → Yahoo enriches data
    lib/yahoo.ts                # yahoo-finance2 wrapper (historical prices, ETF details)
    lib/cache.ts                # In-memory TTL cache for search results and suggestions
    lib/suggestions.ts          # AI autocomplete suggestions via OpenRouter (morph model)
web/
  src/
    app.tsx                     # App shell (QueryProvider, search state)
    main.tsx                    # Entry point
    components/
      search-input.tsx          # Search bar + autocomplete dropdown + example industry chips
      etf-table.tsx             # Table with inline expandable chart rows
      performance-chart.tsx     # Recharts area chart (teal/red) with loading overlay
      search-loading.tsx        # Animated multi-step loading indicator
      time-horizon.tsx          # Period toggle (1D–MAX)
      ui/                       # shadcn components
    hooks/use-etf.ts            # useSearchETFs (mutation), useSuggestions (query), useETFHistory (query)
    lib/
      api.ts                    # ky client (prefixUrl, 120s timeout)
      types.ts                  # ETF, SearchResponse, SuggestionsResponse, PricePoint, Period
      utils.ts                  # cn() utility
```

## Running

```bash
cp api/.env.example api/.env    # Add OPENROUTER_API_KEY, optionally set SEARCH_CACHE_TTL_SECONDS
bun install
bun run dev                     # Starts API (:3001) + Vite (:5173)
```

## Build

```bash
bun run --filter web build      # Type-checks (tsc -b) then builds Vite production bundle
```

The API has no build step — it runs directly via `bun run --hot`.

## Lint

```bash
bun run lint                    # Ultracite check (Biome-based format + lint) across the whole repo
bun run lint:fix                # Auto-fix with Ultracite
```

Linting uses [Ultracite](https://www.ultracite.ai/) which wraps Biome with opinionated defaults. Config extends `ultracite/core` + `ultracite/react` in `biome.json`.

## API Endpoints

- `GET /api/etfs/suggestions?q=string` — AI autocomplete suggestions, returns `{ suggestions: string[] }`. Cached with `suggestions:` key prefix, lowercased. Returns empty array if `q < 2 chars` or on error.
- `POST /api/etfs/search` — body: `{ industry: string }` → `{ etfs: ETF[], summary: string }`
- `GET /api/etfs/:symbol/history?period=1Y` — periods: 1D, 5D, 1M, 6M, YTD, 1Y, 5Y, MAX (or `from`+`to` for custom)

## Key Patterns

- **Mastra workflow**: `createStep`/`createWorkflow` from `@mastra/core/workflows`, executed via `workflow.createRun()` then `run.start()`
- **OpenRouter**: `createOpenAI({ baseURL: "https://openrouter.ai/api/v1" })` from `@ai-sdk/openai`, model: `anthropic/claude-opus-4.6`
- **yahoo-finance2 v3**: Requires `new YahooFinance()` instantiation before use
- **ETF data shape**: `{ symbol, name, description, mer, topCountries: { country, allocation }[], productUrl, provider, exchange, currency, currentPrice }`
- **Search cache**: In-memory TTL cache (`lib/cache.ts`), key = lowercased+trimmed query, TTL via `SEARCH_CACHE_TTL_SECONDS` env (default 3600s). Identical queries skip AI + Yahoo.
- **Two-step workflow**: Step 1 (AI) picks symbols + country allocations + summary. Step 2 enriches from Yahoo Finance (name, description, MER, provider, exchange, currency, price). Country data comes from AI, everything else from Yahoo.
- **Exchange normalization**: Yahoo exchange names mapped to friendly names (NYSEArca → NYSE, NasdaqGM → NASDAQ) in `yahoo.ts`
- **1D fallback**: If 1-day period returns no data (weekend/holiday), retries up to 5 times shifting back one day
- **Autocomplete suggestions**: `lib/suggestions.ts` uses `generateObject` with a fast model (`openai/gpt-oss-safeguard-20b`) via OpenRouter. Frontend debounces input by 300ms (`@uidotdev/usehooks`), shows dropdown with keyboard nav (ArrowUp/Down, Enter, Escape) and ARIA combobox roles. Cached server-side with `suggestions:` prefix.
- **UI**: Table rows expand inline to show about + country bars + chart. NumberFlow for animated price transitions. Chart keeps previous data visible with loading overlay during period switches.
