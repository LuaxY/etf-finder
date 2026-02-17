# ETF Finder

**[etf-finder.up.railway.app](https://etf-finder.up.railway.app)**

AI-powered ETF discovery tool. Describe an industry or investment theme, get curated ETF recommendations powered by Claude, and explore historical performance charts with real-time pricing from Yahoo Finance.

## Features

- **Natural language search** — describe what you want to invest in (e.g. "clean energy", "semiconductor manufacturing") and get relevant ETF picks
- **AI autocomplete** — intelligent suggestions as you type, powered by a fast LLM
- **Real-time data** — current prices, MER, exchange info, and geographic allocation pulled from Yahoo Finance
- **Interactive charts** — historical performance with multiple time horizons (1D to MAX)
- **Animated UI** — staggered transitions, expandable table rows, and smooth chart loading

## Tech Stack

| Layer | Stack |
|-------|-------|
| Runtime | Bun (workspaces) |
| Backend | Elysia, Mastra workflows, Vercel AI SDK, yahoo-finance2 |
| Frontend | Vite, React 19, TanStack Query, Tailwind CSS, shadcn/ui, Recharts, Framer Motion |
| AI | OpenRouter → Claude (via `@ai-sdk/openai`) |

No database — fully stateless with an in-memory TTL cache.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- An [OpenRouter](https://openrouter.ai) API key

### Setup

```bash
git clone <repo-url>
cd etf-recommendation
cp api/.env.example api/.env   # add your OPENROUTER_API_KEY
bun install
```

### Development

```bash
bun run dev        # starts API (:3001) + Vite dev server (:5173)
bun run dev:api    # API only
bun run dev:web    # frontend only
```

### Production Build

```bash
bun run build      # type-checks and builds the Vite bundle
bun run start      # starts the API server
```

### Linting

```bash
bun run lint       # check formatting and lint rules
bun run lint:fix   # auto-fix
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/etfs/suggestions?q=` | AI-powered autocomplete suggestions |
| `POST` | `/api/etfs/search` | Search ETFs by industry (body: `{ industry: string }`) |
| `GET` | `/api/etfs/:symbol/history?period=1Y` | Historical price data (1D, 5D, 1M, 6M, YTD, 1Y, 5Y, MAX) |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | Yes | — | API key for OpenRouter |
| `SEARCH_CACHE_TTL_SECONDS` | No | `3600` | How long search results stay cached |

## How It Works

1. **You describe** an investment theme or industry
2. **Claude analyzes** your query and selects relevant ETF symbols with geographic allocation data
3. **Yahoo Finance** enriches each pick with real-time pricing, MER, provider, and exchange info
4. **Results appear** in an interactive table — expand any row to see a description, country breakdown, and performance chart

## Project Structure

```
api/                        # backend workspace
  src/
    index.ts                # Elysia server entry
    routes/etf.ts           # API route handlers
    mastra/                 # Mastra AI workflow
    lib/                    # Yahoo Finance client, cache, suggestions
web/                        # frontend workspace
  src/
    app.tsx                 # App shell
    components/             # Search input, ETF table, charts, loading states
    hooks/                  # TanStack Query hooks
    lib/                    # API client, types, utilities
```

## License

MIT
