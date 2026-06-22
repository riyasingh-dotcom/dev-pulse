# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

Dev-pulse is a developer analytics and AI coaching platform with two workspaces:

- `devpulse-backend/` — NestJS v11 REST API (port 3001); GitHub API + Groq LLM
- `devpulse-frontend/` — Next.js 16 / React 19 app (port 3000)

**Next.js v16 warning:** Breaking changes from earlier versions. Before writing frontend code, read the relevant guide in `devpulse-frontend/node_modules/next/dist/docs/`.

## Commands

### Backend (`devpulse-backend/`) — uses **pnpm**

```bash
pnpm start:dev                       # hot-reload dev server (port 3001)
pnpm build && pnpm start:prod        # compile + run production
pnpm lint                            # ESLint --fix
pnpm format                          # Prettier --write
pnpm test                            # unit tests (src/**/*.spec.ts)
pnpm test -- src/some.spec.ts        # single test file
pnpm test:cov                        # coverage report
pnpm test:e2e                        # Supertest E2E (test/jest-e2e.json)
```

### Frontend (`devpulse-frontend/`) — uses **npm**

```bash
npm run dev        # Next.js dev server (port 3000)
npm run build      # production build
npm run lint       # ESLint
```

## Environment Variables

**`devpulse-backend/.env`** (required):
```
PORT=3001
GROQ_API_KEY=<groq api key>
DASHBOARD_PIN=<4-digit pin>
GITHUB_API_BASE=https://api.github.com
GITHUB_TOKEN=<optional — raises rate limit from 60 to 5000 req/hr>
```

**`devpulse-frontend/.env.local`**:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Backend CORS is hardcoded to `localhost:3000` in `main.ts` — update it for any other origin. Backend injects all config via `ConfigService`; never read `process.env` directly in services.

## Backend Architecture

NestJS module pattern: controller (thin route handler) → service (all business logic). Four feature modules registered in `app.module.ts`:

| Module | Endpoints | Notes |
|--------|-----------|-------|
| `AuthModule` | `POST /auth/verify-pin` | Timing-safe `crypto.timingSafeEqual` against `DASHBOARD_PIN` env var |
| `GithubModule` | `GET /github/:username/summary` | Parallel GitHub API calls via `Promise.all`; partial failures handled gracefully |
| `ReportModule` | `POST /report/stream` | SSE via RxJS Observable; aborts on client disconnect; emits `[DONE]` as terminator |
| `ChatModule` | `POST /chat` | Stateless — client sends full `{ summary, report, messages[] }` history each request |

Global `ValidationPipe(whitelist + forbidNonWhitelisted + transform)` in `main.ts`.

**GitHub API constraints to know:**
- Events API page size is fixed at 30 (ignores `per_page`); max 300 events across 10 pages — very active users may only see the last few days
- PR/issue counts use the Search API, which has a stricter separate rate limit
- All event-derived fields (`totalCommits`, `activeDays`, `longestStreak`) are estimates for the events window only, not all-time

**LLM:** `llama-3.3-70b-versatile` via Groq SDK. The report stream escapes newlines as `\n` within SSE `data:` lines; the frontend unescapes on receipt.

## Frontend Architecture

Everything renders from `app/page.tsx` (one route, no sub-pages). All mutable state lives in `useReducer`, not `useState`, because the **react-compiler lint rule** prohibits calling `setState` synchronously inside `useEffect` — `dispatch` is exempt from this rule.

**Auth gate** — runs before anything else:
1. `authReducer` starts at `{ authed: false, checked: false }`
2. A `useEffect` dispatches `CHECK` after hydration by reading `localStorage` via `lib/auth.ts`
3. Returns `null` while `checked === false` (prevents flash of the PIN screen on returning users)
4. Renders `<PinAuth>` if not authed; `PinAuth` calls `POST /auth/verify-pin` then dispatches `UNLOCK` and writes to `localStorage`

**Data flow through `lib/`:**
- `lib/api.ts` — all fetch calls (`getGithubSummary`, `streamReport`, `sendChat`)
- `lib/scoring.ts` — pure function: derives `ProductivityScores` from `GitHubSummary` (no API)
- `lib/parseReport.ts` — parses the structured LLM text into `{ overview, strengths, improvements, weeklyChallenge }`; safe to call on empty/partial strings while streaming
- `lib/storage.ts` — persists `{ summary, report, messages }` to `localStorage`; restored in a `useEffect` → `dispatch` to avoid hydration mismatch
- `lib/auth.ts` — persists auth flag to `localStorage`; `verifyPin` API call

**LLM report format** — the model is prompted to emit section headers that `parseReport` splits on:
```
OVERVIEW:
<paragraph>
STRENGTHS:
- item
IMPROVEMENTS:
- item
WEEKLY_CHALLENGE:
- item
```

**Scoring (`lib/scoring.ts`):**
- `velocity` = (commits ÷ active days) × 10, capped at 100
- `consistency` = streak score 60% + active-day ratio 40% (21-day reference window)
- `impact` = PRs + 0.7 × issues closed, normalised against 30
- `overall` = velocity 35% + consistency 35% + impact 30%

**Theming:** Tailwind v4 + shadcn. CSS variables defined in `app/globals.css` using `oklch()`. Dark mode uses the `.dark` class on `<html>`. Always use semantic tokens (`bg-card`, `border-border`, `text-foreground`) — never hardcode `bg-white` or raw colours.

## TypeScript & Code Style

Both workspaces: strict TypeScript, `type` over `interface`, `satisfies` for config objects, no `any`, no `as` assertions. Backend Prettier: single quotes, trailing commas.

## Testing

- Backend unit tests co-located: `foo.service.ts` → `foo.service.spec.ts`
- E2E tests in `devpulse-backend/test/` using Supertest against the full NestJS app
- Use `@nestjs/testing` `Test.createTestingModule()` for DI; mock with `jest.spyOn` + `mockRestore` in `afterEach`
- Frontend has no test setup currently
