# ElectroShop

A production-ready Next.js 15 + React 19 ecommerce starter with Clerk auth, Stripe Checkout, Prisma (PostgreSQL), and Tailwind v4.

## Prerequisites
- Node.js >= 20.11
- PostgreSQL database
- Clerk account (Publishable + Secret keys)
- Stripe account (Secret key + Webhook secret)

## Environment
Copy `.env.example` to `.env` and fill values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_ADMIN_ID`

## Setup
```bash
npm ci
npm run db:migrate:dev
npm run db:seed # optional
npm run dev
```

## Prisma
- Generate: `npm run postinstall` (auto)
- Migrate dev: `npm run db:migrate:dev`
- Deploy migrations: `npm run db:migrate:deploy`
- Studio: `npm run db:studio`

## Scripts
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Order migration: `npm run script:migrate-orders` (requires `MIGRATE_USER_ID`, `MIGRATE_EMAIL`)

## Stripe Webhooks (local)
```bash
# Replace with your endpoint URL if not default
npx stripe listen --forward-to localhost:3000/api/webhook
```
Set `STRIPE_WEBHOOK_SECRET` from the listen command output.

## Production
- Builds: `npm run build`
- Start: `npm start` (runs `prisma migrate deploy` then `next start`)
- Ensure the following env vars are set in your host (Vercel, Railway, Fly.io, etc.)
  - `DATABASE_URL`, Clerk keys, Stripe keys, `NEXT_PUBLIC_ADMIN_ID`

## Security and hardening
- Security headers via `next.config.ts`
- Rate limit on reviews POST in `src/middleware.ts`
- Prisma query logging disabled in production

## Notes
- Image domains are whitelisted in `next.config.ts`
- Prisma client output is generated to `src/generated/prisma`
