# ETF Recommendation

AI-powered ETF discovery tool. Search by industry, get recommendations from Claude, view historical performance charts.

## Tech Stack

- **Runtime**: Bun (workspaces: `api/`, `web/`)
- **Backend**: Elysia + Mastra workflow + Vercel AI SDK + yahoo-finance2
- **Frontend**: Vite + React 19 + TanStack Query + Tailwind CSS + shadcn/ui + Recharts + Framer Motion
- **AI**: OpenRouter → Claude (via `@ai-sdk/openai` with custom baseURL)
- **No database** — stateless request/response

## Project Structure

```
api/
  src/
    index.ts                    # Elysia server (port 3001, CORS)
    routes/etf.ts               # POST /api/etfs/search, GET /api/etfs/:symbol/history
    mastra/
      index.ts                  # Mastra instance
      workflows/etf-search.ts   # AI workflow: generateObject → ETF recommendations
    lib/yahoo.ts                # yahoo-finance2 wrapper (historical prices)
web/
  src/
    App.tsx                     # App shell (QueryProvider, search state)
    main.tsx                    # Entry point
    components/
      search-input.tsx          # Search bar + example industry chips
      etf-table.tsx             # Table with inline expandable chart rows
      performance-chart.tsx     # Recharts area chart (green/red gradient)
      time-horizon.tsx          # Period toggle (1D–MAX)
      ui/                       # shadcn components
    hooks/use-etf.ts            # useSearchETFs (mutation), useETFHistory (query)
    lib/
      api.ts                    # ky client (prefixUrl, 120s timeout)
      types.ts                  # ETF, SearchResponse, PricePoint, Period
      utils.ts                  # cn() utility
```

## Running

```bash
cp api/.env.example api/.env    # Add OPENROUTER_API_KEY
bun install
bun run dev                     # Starts API (:3001) + Vite (:5173)
```

## API Endpoints

- `POST /api/etfs/search` — body: `{ industry: string }` → `{ etfs: ETF[], summary: string }`
- `GET /api/etfs/:symbol/history?period=1Y` — periods: 1D, 5D, 1M, 6M, YTD, 1Y, 5Y, MAX (or `from`+`to` for custom)

## Key Patterns

- **Mastra workflow**: `createStep`/`createWorkflow` from `@mastra/core/workflows`, executed via `workflow.createRun()` then `run.start()`
- **OpenRouter**: `createOpenAI({ baseURL: "https://openrouter.ai/api/v1" })` from `@ai-sdk/openai`, model: `anthropic/claude-opus-4.6`
- **yahoo-finance2 v3**: Requires `new YahooFinance()` instantiation before use
- **ETF data shape**: `{ symbol, name, description, mer (percentage number, e.g. 0.45 = 0.45%), topCountries: { country, allocation }[], productUrl, provider }`
- **UI**: Table rows expand inline (below clicked row) to show chart + details with Framer Motion animation
