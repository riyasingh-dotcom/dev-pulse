# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**devpulse-backend** — NestJS v11 REST API. Integrates GitHub API and Groq AI (LLM). Early development; the starter scaffold is in place but features are not yet built.

All source code lives under `devpulse-backend/`. Run all commands from that directory.

## Commands

```bash
# Development
pnpm start:dev          # hot-reload dev server (port from .env PORT, default 3000)
pnpm start:debug        # dev server + Node debugger

# Build & Production
pnpm build              # compile TypeScript → dist/
pnpm start:prod         # run compiled dist/main.js

# Quality
pnpm lint               # ESLint --fix
pnpm format             # Prettier --write

# Testing
pnpm test               # unit tests (src/**/*.spec.ts)
pnpm test:watch         # unit tests in watch mode
pnpm test:cov           # unit tests + coverage report
pnpm test:e2e           # E2E tests (test/jest-e2e.json)
pnpm test:debug         # unit tests with Node inspector
```

To run a single test file: `pnpm test -- src/app.controller.spec.ts`

## Environment Variables

Copy or create `devpulse-backend/.env`:

```
PORT=3001
GROQ_API_KEY=<groq api key>
DASHBOARD_PIN=<pin>
GITHUB_API_BASE=https://api.github.com
```

`ConfigModule.forRoot({ isGlobal: true })` is already wired in `AppModule` — inject `ConfigService` to read these anywhere.

## Architecture

NestJS module pattern: each feature gets its own module (`*.module.ts`) with a controller and service pair.

- **Controllers** — thin route handlers only; delegate everything to the service
- **Services** — all business logic, API calls (axios / groq-sdk), data transformation
- **AppModule** (`src/app.module.ts`) — root module; import feature modules here
- **main.ts** — bootstrap only; global pipes/filters go here, not in modules

Use `class-validator` + `class-transformer` DTOs to validate all incoming request bodies. Use `ConfigService` (never `process.env` directly) inside services.

## Testing Conventions

- Unit tests co-located: `foo.service.ts` → `foo.service.spec.ts` inside `src/`
- E2E tests in `test/` using Supertest against the full NestJS app
- Use `@nestjs/testing` `Test.createTestingModule()` for unit tests; mock dependencies with `jest.spyOn` + `mockRestore` in `afterEach`

## TypeScript

Strict mode is on. Prefer `type` over `interface`, `satisfies` for config literals. No `any` — use `unknown` + type narrowing or Zod for external payloads. No type assertions (`as`).
