# Wayfarer — Honest Ratings, Fair Bookings

A full-stack city guide for discovering places in **Addis Ababa**, reading and submitting honest reviews, and reserving guided tours with zero risk of overbooking.

Built with Next.js (App Router), React 19, Tailwind CSS, Framer Motion, Prisma ORM, PostgreSQL, and Neon Object Storage (S3-compatible API).

---

## Key Features

- **Honest Bayesian Ranking**: Overcomes the "single 5-star review outranking 300+ solid reviews" problem using a Bayesian dampened scoring formula (`(count * avg + 5 * 3.5) / (count + 5)`).
- **Concurrency-Safe Tour Bookings**: Prevents race conditions and overbooking under simultaneous parallel requests using PostgreSQL row locking (`SELECT ... FOR UPDATE`) in an isolated transaction.
- **Multi-Page Architecture**:
  - `/`: Discover & Explore catalog with category filtering (`All`, `History`, `Food`, `Nature`), live keyword search, and top-rated server sorting.
  - `/places/[id]`: Dedicated Place Detail page featuring landmark photography, Addis Ababa time tour slots (`Africa/Addis_Ababa`), live seat availability indicators, and community reviews.
  - `/account`: Dedicated Account Picker with persona cards for seeded travellers (Sara, Abel, and Liya).
- **Identity & Sign-Out**: Displays active traveller pill in the header with one-click "Sign out" to switch personas. Passes identity via the `X-User-Id` HTTP header.
- **Neon Object Storage & Resilient Imagery**: Built-in support for Neon Object Storage (S3 wire-protocol with path-style addressing) and image upload endpoint (`/api/upload`), with curated high-resolution landmark photography fallbacks.
- **Framer Motion Animations & Shimmer Skeletons**: Fluid page transitions, staggered card reveals, interactive seat gauges, and loading skeleton states.

---

## Quickstart (Run Locally in 3 Commands)

### Prerequisites
- [Bun](https://bun.sh/) 1.4+ (or Node.js 20+)
- Docker (for one-shot local setup) OR remote Neon PostgreSQL & Neon Object Storage

### 1. One-Shot Setup with Docker (Recommended)

Start local PostgreSQL and MinIO S3 storage:

```sh
docker compose up -d
```

*(This automatically starts the app database on port `54322`, the isolated test database on port `54323`, and local S3 object storage on port `9000`)*.

Copy environment variables and run setup:

```sh
cp apps/web/.env.example apps/web/.env
bun install
bun run setup
bun run dev
```

Open [http://localhost:3001](http://localhost:3001).

### 2. Using Remote Neon Postgres & Neon Object Storage

Alternatively, point `.env` directly to your remote Neon branches:

```ini
DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-proj-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require"
TEST_DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-test-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Neon Object Storage S3 credentials (optional — public fallbacks are provided)
AWS_ENDPOINT_URL_S3="https://<branch-id>.storage.<cell>.us-east-2.aws.neon.tech"
AWS_ACCESS_KEY_ID="nak_live_..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-2"
NEON_STORAGE_BUCKET="wayfarer-images"
```

Then run `bun run setup && bun run dev`.

---

## Running Tests

Run both required tests with a single command:

```sh
bun run test
```

- **`tests/ranking.test.ts`**: Verifies that a single 5-star review never outranks an established attraction with 312 reviews at 4.7.
- **`tests/booking.test.ts`**: Fires 12 parallel HTTP booking requests against a tour slot with only 1 remaining seat. Verifies that exactly 1 request succeeds (HTTP 200) and the remaining 11 receive HTTP 409 Conflict.

Type checking and build verification:

```sh
bun run check-types
bun run build
```

---

## Known Limitations & Design Tradeoffs

- **No Passwords**: Following the assessment specification, identity is demonstrated via persona switching (`X-User-Id`), without external auth providers.
- **Seeded Tour Dates**: Seeded tour slots are relative dates (+7 days) to demonstrate live booking.
- **Pagination**: The Addis Ababa catalog is sized for ~10 seeded places; an enterprise-scale catalogue would implement database-level cursor pagination.
