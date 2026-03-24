# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Miles & More Frontend — Next.js 16 App Router standalone frontend for a Twitch-integrated airline simulation. React 19, Tailwind CSS v4, next-auth with Twitch provider. Deployed to Vercel.

The backend (separate repo/folder: `milesandmore-backend`) is a Fastify server that this frontend proxies API requests to.

## Commands

| Task | Command |
|---|---|
| Install | `npm install` |
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Start | `npm run start` |
| Lint | `npm run lint` |
| Lint single file | `npx eslint <file>` |
| Type-check | `npx tsc --noEmit` |

No test runner configured. No `*.test.*` or `*.spec.*` files exist.

## Architecture

### Request Flow

Frontend pages/components → `src/lib/botApi.ts` → `src/app/api/backend/[...path]/route.ts` (proxy with auth) → Backend

The proxy strips sensitive headers, checks admin auth via next-auth session, and forwards `x-internal-job-secret` only for authorized admin users.

### Layers

- **Pages**: `src/app/` — server components by default, `"use client"` only when needed
- **Components**: `src/components/` — admin panels, flight UI, layout, shared UI
- **API client**: `src/lib/botApi.ts` — centralized backend calls
- **Auth**: `src/auth.ts` — next-auth with Twitch provider
- **Types**: `src/lib/types.ts` — shared domain types
- **Styling**: `src/app/globals.css` — design tokens, Tailwind v4

### Key Pages

- `/` — landing / flight dashboard
- `/flight/[hash]` — individual flight + boarding pass
- `/leaderboard` — miles leaderboard
- `/commands` — bot command reference
- `/admin` — admin dashboard (channel management, flight control, bot logs)

## Key Conventions

- **TypeScript strict**; do not weaken tsconfig
- **`@/*` alias** for imports from `src/`, prefer over long relative paths
- **`import type`** for type-only imports
- **Wire-format fields stay snake_case** to match backend payloads; local variables are camelCase
- **Server components by default**; add `"use client"` only when hooks/browser APIs are needed
- Centralize backend calls in `src/lib/botApi.ts`
- Use Tailwind with existing design tokens from `src/app/globals.css`; airline-premium visual style
- Formatting: semicolons, double quotes, 2-space indent, trailing commas
- **UI labels can be German** when they match surrounding feature copy
