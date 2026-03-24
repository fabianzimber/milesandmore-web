# GEMINI.md

This file gives coding agents the minimum project-specific guidance needed to work safely and consistently in this repository.

## Project Snapshot

- App: standalone Next.js App Router frontend for Miles & More.
- Language: TypeScript with `strict` mode enabled.
- Styling: Tailwind CSS v4 plus custom design tokens in `src/app/globals.css`.
- Auth: `next-auth` with Twitch provider.
- Rendering mix: server components by default, client components where interactivity is needed.
- API shape: frontend proxies backend requests through `src/app/api/backend/[...path]/route.ts` and uses helper calls from `src/lib/botApi.ts`.

## Source Layout

- `src/app`: App Router pages, layouts, route handlers, Open Graph images, error/loading states.
- `src/components`: feature and shared React components.
- `src/lib`: API helpers, domain types, utility helpers, OG helpers, DB helpers.
- `src/auth.ts`: NextAuth configuration and exported auth helpers.
- `src/app/globals.css`: design tokens, theme aliases, utility classes, global resets.

## Package Manager And Setup

- Primary lockfile present: `package-lock.json`, so default to `npm` commands.
- Install dependencies first: `npm install`.
- Local env bootstrap: `cp .env.example .env.local`.
- Dev server: `npm run dev`.
- Production server after build: `npm run start`.

## Build / Lint / Test Commands

- Install deps: `npm install`
- Start dev server: `npm run dev`
- Create production build: `npm run build`
- Start production server: `npm run start`
- Run all lint checks: `npm run lint`

## Single-File / Targeted Commands

- Lint a single file: `npx eslint src/components/ui/SASButton.tsx`
- Lint a directory: `npx eslint src/components/admin`
- Type-check the project without emitting: `npx tsc --noEmit`
- Type-check a focused file through the project config: `npx tsc --noEmit --pretty false`

## Test Status

- There is currently no `test` script in `package.json`.
- No Jest, Vitest, Playwright, Cypress, or `*.test.*` / `*.spec.*` files are present in the repository.
- Because no automated test runner is configured, there is currently no supported command for running a single test.
- If you add tests in the future, also add explicit `test` and single-test guidance here.

## Command Reality Check

- `npm run lint` and `npm run build` are the intended verification commands.
- In the current workspace snapshot they fail before execution if dependencies are not installed (`eslint` / `next` not found).
- If you need to verify changes, run `npm install` first.

## Environment Variables

Important values referenced by the app include:

- `BACKEND_PUBLIC_URL`
- `NEXT_PUBLIC_BOT_API_URL`
- `MILESANDMORE_INTERNAL_API_SECRET`
- `AUTH_SECRET`
- `TWITCH_APP_CLIENT_ID`
- `TWITCH_APP_CLIENT_SECRET`
- `ADMIN_TWITCH_IDS`
- `NEXT_PUBLIC_APP_URL` or deployment URL equivalent used in metadata

Rules for agents:

- Never hardcode secrets.
- Prefer reading server-only secrets only in server code.
- Keep `NEXT_PUBLIC_*` values limited to data safe for the browser.
- Preserve the backend proxy behavior when changing API access.

## TypeScript Rules

- Keep TypeScript strictness intact; do not weaken `tsconfig.json`.
- Prefer explicit interfaces and type aliases for domain data.
- Use `import type` for type-only imports.
- Prefer `unknown` over `any`; narrow before use.
- Preserve backend-facing field names exactly when they are snake_case (`channel_name`, `icao_from`, `participant_hash`, etc.).
- Use camelCase for local variables, function params, component state, and derived UI data.
- Annotate public helpers and route handlers when the return type is not obvious.
- For React props, use named `interface` or `type` aliases instead of inline complex object types when reused or non-trivial.

## Imports

- Follow the existing grouping pattern:
  1. framework / platform imports (`react`, `next/*`)
  2. third-party packages (`framer-motion`, `lucide-react`, `next-auth`)
  3. internal alias imports from `@/`
  4. relative imports
- Keep type imports separate with `import type`.
- Prefer the `@/*` alias over long relative traversals when importing from `src`.
- Keep imports stable and minimal; remove unused imports immediately.

## Naming Conventions

- React components: PascalCase function names and PascalCase filenames for shared components.
- App Router special files: use Next.js naming (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`).
- Utility functions: camelCase and verb-oriented names (`formatDistance`, `parseSeatConfig`, `resolveApiBase`).
- Interfaces and type aliases: PascalCase.
- Constants: `UPPER_SNAKE_CASE` for module-level immutable values with semantic importance.
- Internal UI labels/messages can remain German if they match the surrounding feature copy.

## React / Next.js Conventions

- Default to server components; add `"use client"` only when hooks, browser APIs, or client-only libraries are required.
- Keep page modules thin when possible; push interactive UI into `src/components`.
- Use Next.js primitives where appropriate (`redirect`, metadata exports, route handlers, `Image`).
- Preserve `export const dynamic = "force-dynamic"` only where runtime behavior truly requires it.
- When fetching in server code, prefer parallel requests with `Promise.all` when independent.
- When building polling UIs, clean up intervals in `useEffect` returns.

## Formatting

- Match the existing code style: semicolons, double quotes, trailing commas where the formatter would place them.
- Use 2-space indentation.
- Keep JSX readable by breaking long prop lists across lines.
- Prefer concise expressions, but do not collapse code so much that UI logic becomes hard to scan.
- Keep one blank line between logical sections; avoid excessive vertical whitespace.

## Styling Conventions

- Use Tailwind utility classes for component styling.
- Reuse design tokens and utility classes from `src/app/globals.css` before inventing new colors or shadows.
- Prefer semantic token names (`bg-background`, `text-foreground`, `text-sas-gray-500`) over raw hex values unless the file already uses a bespoke gradient/effect.
- Preserve the existing visual language: premium airline-inspired UI, gradients, glow, glass, motion, and branded surfaces.
- Ensure new UI works on mobile and desktop.

## Error Handling

- Throw `Error` objects for invalid configuration or failed backend requests in shared/server utilities.
- In client components, catch async failures and either surface a user-facing message or deliberately keep stale UI state.
- Narrow caught values with `instanceof Error` before reading `.message`.
- Avoid swallowing errors silently unless stale-data fallback is intentional and harmless.
- Preserve proxy/header handling in backend route forwarding code.

## API / Data Rules

- Centralize backend calls in `src/lib/botApi.ts` unless there is a strong reason not to.
- Keep the internal secret header behavior intact for server-side calls.
- Maintain `cache: "no-store"` where the current code relies on fresh operational data.
- Match backend payload keys exactly; do not rename wire-format fields for convenience.
- Prefer extending the shared types in `src/lib/types.ts` instead of scattering duplicate inline backend shapes.

## Editing Guidance For Agents

- Before changing behavior, inspect neighboring files and follow local patterns instead of introducing a new style.
- Keep comments sparse; add them only for non-obvious logic.
- Do not refactor unrelated areas while making a focused change.
- If you introduce a new command or workflow, update this file.
- If you add automated tests, document both the full suite command and the single-test command.

## Useful Reference Files

- `package.json`
- `README.md`
- `tsconfig.json`
- `eslint.config.mjs`
- `src/lib/types.ts`
- `src/lib/botApi.ts`
- `src/app/api/backend/[...path]/route.ts`
- `src/app/globals.css`

## Bottom Line

- Use `npm`.
- Respect strict TypeScript and backend wire formats.
- Prefer `@/` imports, `import type`, and existing Tailwind/design-token patterns.
- There is no test runner yet, so call that out instead of inventing test commands.
