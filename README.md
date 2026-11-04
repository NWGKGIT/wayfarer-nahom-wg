# Wayfarer

A small Addis Ababa city guide for discovering places, reading and writing reviews, and reserving guided tours. Select a traveller in the header; this is a demonstration identity switcher, not authentication. Category filtering and ranking are performed on the server. Tour times are displayed in Addis Ababa time.

## Run locally

Prerequisites: Bun 1.4, Node.js, and two separate PostgreSQL databases (for example, two Supabase projects). Copy `apps/web/.env.example` to `apps/web/.env` and set `DATABASE_URL` and `TEST_DATABASE_URL`. Use PostgreSQL connection strings only; no Supabase API keys or other services are needed. Prisma migrations need a connection that supports migrations, such as a direct or session pooler connection. Keep `.env` private.

From the repository root:

```sh
bun install
bun run setup
bun run dev
```

Open http://localhost:3001. Setup generates the Prisma client, applies migrations, and seeds the app database. Reseeding preserves existing reviews, bookings, and tour slots. The seeded dates are relative to the first seed, so they will eventually become stale.

Run `bun run test` for the ranking unit test and the parallel HTTP booking test. The latter applies migrations to `TEST_DATABASE_URL`, creates uniquely named test records, and cleans them up. It refuses the app database if both URLs identify the same host, port, and database. Use a dedicated test database; migration deployment changes its schema. Run `bun run check-types` and `bun run build` for additional checks.

## Known limitations

- There is no authentication, payment, cancellation, tour administration, or booking history, as these are outside the exercise. Anyone can act as a seeded user.
- A repeated booking request can create another booking if enough seats remain; request idempotency is an optional bonus and is not implemented.
- Seeded places, reviews, and tours are illustrative rather than verified travel information. Seeded dates are not automatically renewed.
- Rankings use a fixed prior and the list is loaded as one small dataset; larger catalogues would need indexed aggregation and pagination.
- Screenshots are not yet available: the database connections required to run the seeded application were not available during implementation.
