# Miles & More Web

Standalone Next.js web frontend for Miles & More, intended for Vercel deployment.

## What is included

- Full app router code (`src/app/*`)
- Auth + admin UI
- Flight dashboard UI
- Styling/layout/components (`src/components/*`)
- Backend API client (`src/lib/botApi.ts`)

## Local run

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Required env

- `NEXT_PUBLIC_BOT_API_URL` must point to the Railway backend URL.
- `AUTH_SECRET`, `TWITCH_APP_CLIENT_ID`, `TWITCH_APP_CLIENT_SECRET`, `ADMIN_TWITCH_IDS` are required for admin auth.
