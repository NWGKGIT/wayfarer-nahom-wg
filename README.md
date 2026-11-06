# Wayfarer — Addis Ababa City Guide

A full-stack city guide for discovering places in **Addis Ababa**, reading and submitting honest community reviews, reserving guided tours with zero risk of overbooking, and curating the catalog through a dedicated administrator portal.

Built with **Next.js (App Router)**, **React 19**, **Tailwind CSS**, **Framer Motion**, **Prisma ORM**, **PostgreSQL**, and **Neon Object Storage** (S3-compatible API).

---

## Key Highlights

- **Honest Bayesian Ranking**: Overcomes the "single 5-star review outranking 300+ solid reviews" problem using a Bayesian dampened scoring formula (`(count * avg + 5 * 3.5) / (count + 5)`).
- **Concurrency-Safe Tour Bookings**: Completely prevents race conditions and overbooking under simultaneous parallel requests using PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) in an isolated transaction with HTTP 409 Conflict safety.
- **Admin Persona & Curator Control Room (`/admin`)**:
  - Full catalog management: create new landmark places or remove existing ones with cascade clean-up.
  - Guided tours scheduler: schedule new tour slots with custom date/time (in Addis Ababa local time, UTC+3) and seat capacities, inspect live bookings, and cancel slots.
  - Traveller persona manager: create custom traveller identities that dynamically synchronize across the app, or remove old ones (with permanent deletion protection for Admin).
  - In-page controls: schedule tour slots directly on any place detail page (`/places/[id]`) without navigating away.
- **Multi-Page Architecture**:
  - `/`: Explore catalog with category filtering (`All`, `History`, `Food`, `Nature`), instant keyword search, and custom designed sort dropdown (`Top rated`, `Most reviewed`, `Highest average`, `Name A–Z`).
  - `/places/[id]`: Dedicated Place Detail page featuring authentic landmark photography, guided tour scheduler and live seat counters, and individual community review cards.
  - `/account`: Dedicated Persona Switcher with rich cards for Sara, Abel, Liya, Admin, and custom created personas.
  - `/admin`: Dedicated City Curator Control Room.
- **Editorial Royal Blue Design System**:
  - Classic editorial typography pairing `DM Serif Display` with `DM Sans`.
  - Geometric vector Wayfinder compass logo with multi-resolution favicons (`.ico`, `.svg`, `apple-touch-icon.png`, PWA `site.webmanifest`).
  - Zero raw arrow glyphs (`↗`, `→`, `←`) or asterisks (`✳`); clean button typography and semantic actions.
  - Authentic high-resolution Addis Ababa landmark photography bundled locally for 0ms latency and 100% offline reliability.
- **Framer Motion & Dynamic Shimmer Skeletons**: Fluid page transitions, staggered card reveals, and animated loading skeletons.

---

## Quickstart (Run Locally in 3 Commands)

### Prerequisites
- [Bun](https://bun.sh/) 1.4+ (or Node.js 20+)
- Docker (for one-shot local setup) OR remote Neon PostgreSQL & Neon Object Storage

### 1. One-Shot Setup with Docker (Recommended)

Run these 3 commands from the repository root:

```sh
# 1. Start local PostgreSQL and RustFS S3 object storage
docker compose up -d

# 2. Configure environment and initialize database with seed data
cp .env.example .env && cp .env.example apps/web/.env && bun install && bun run setup

# 3. Start the development server
bun run dev
```

Open [http://localhost:3001](http://localhost:3001).

*(Docker automatically starts PostgreSQL on port `54322`, an isolated test database on port `54323`, and RustFS S3 storage on port `9000`)*.

---

### 2. Alternative: Using Remote Neon Postgres & Neon Object Storage

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

- **`tests/ranking.test.ts`**: Verifies that a single 5-star review (score 3.75) never outranks an established attraction with 312 reviews at 4.7 (score 4.68).
- **`tests/booking.test.ts`**: Fires 12 parallel HTTP booking requests against a tour slot with only 1 remaining seat. Verifies that exactly 1 request succeeds (HTTP 200) and the remaining 11 receive HTTP 409 Conflict.

TypeScript compilation and production build verification:

```sh
bun run check-types
bun run build
```

---

## Project Structure

```
wayfer-assesment/
├── apps/
│   └── web/                     # Next.js 16 App Router application
│       ├── public/              # Authentic Addis Ababa landmark photos & favicons
│       │   ├── places/          # 10 local landmark photographs
│       │   ├── favicon.ico      # Multi-resolution brand compass icon
│       │   ├── icon.svg         # Scalable vector favicon
│       │   ├── apple-touch-icon.png
│       │   ├── og-image.jpg     # 1200x630 social preview card
│       │   └── site.webmanifest # PWA manifest
│       └── src/
│           ├── app/
│           │   ├── page.tsx          # Catalog explore, search, and category filters
│           │   ├── places/[id]/      # Dedicated place detail & tour booking
│           │   ├── account/          # Persona selector (Sara, Abel, Liya, Admin)
│           │   ├── admin/            # Curator Control Room (Places, Tours, Personas)
│           │   └── api/              # Route handlers (/api/wayfarer, /api/admin, /api/upload)
│           ├── components/           # UI components (PlaceCard, SortDropdown, Navbar, etc.)
│           └── index.css             # Editorial design system in royal blue
├── packages/
│   ├── config/                  # Shared TypeScript configuration
│   └── db/                      # Prisma ORM schema, seed script, and database helpers
│       ├── prisma/schema/       # PostgreSQL schema models
│       └── src/wayfarer.ts      # Bayesian ranking & concurrency-safe booking logic
├── tests/
│   ├── ranking.test.ts          # Bayesian formula unit tests
│   └── booking.test.ts          # Parallel concurrency stress tests
├── docker-compose.yml           # PostgreSQL (54322), Test DB (54323), RustFS S3 (9000)
├── DECISIONS.md                 # Detailed mathematical and architectural decisions
├── AI_USAGE.md                  # Honest notes on AI usage, corrections, and tool history
└── README.md                    # This document
```

---

## Known Limitations & Design Tradeoffs

- **No Passwords**: Following the assessment specification, identity is demonstrated via persona switching (`X-User-Id`), avoiding cumbersome third-party auth barriers.
- **Seeded Tour Dates**: Seeded tour slots are relative dates (+7 days) to demonstrate live booking.
- **Pagination**: The Addis Ababa catalog is sized for ~10 seeded places; an enterprise-scale catalogue would implement database-level cursor pagination.
