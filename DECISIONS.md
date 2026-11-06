# Architectural & Technical Decisions

This document outlines the core technical decisions, mathematical formulas, concurrency protocols, and tradeoffs implemented in Wayfarer, as required by the engineering take-home specification.

---

## 1. Ranking Formula: Bayesian m-Estimate

### The Problem
A naive arithmetic mean (`sum(ratings) / count`) suffers from high variance with small sample sizes. A newly seeded attraction with a single 5-star review (100% 5.0) would outrank a world-renowned landmark with hundreds of reviews averaging 4.7, misleading travellers and distorting the catalog.

### The Mathematical Solution
We implemented a **Bayesian weighted prior** (m-estimate):

$$\text{rankingScore} = \frac{n \times \bar{R} + m \times C}{n + m}$$

Where:
- $n$: The number of submitted reviews for the place.
- $\bar{R}$: The actual arithmetic average of submitted reviews.
- $m$: Prior weight (confidence), set to **5 reviews**.
- $C$: Prior mean (baseline expectation), set to **3.5 stars** (the neutral-to-positive expectation of a curated city guide).

### Scoring Behavior in Practice

| Place | Count ($n$) | Actual Avg ($\bar{R}$) | Bayesian Ranking Score | Catalog Rank |
|---|---|---|---|---|
| **National Museum of Ethiopia** | 312 | 4.70 ★ | **4.681** | **#1** |
| **Holy Trinity Cathedral** | 184 | 4.60 ★ | **4.571** | **#2** |
| **Friendship Park** | 42 | 4.50 ★ | **4.394** | **#3** |
| **New Coffee House** (1 review) | 1 | 5.00 ★ | **3.750** | **#8** |
| **Unreviewed Location** | 0 | 0.00 ★ | **3.500** | **#10** |

- **Early Phase ($n \to 0$)**: The score is pulled toward the prior baseline of 3.5. A single 5-star review produces a score of $(1 \times 5.0 + 5 \times 3.5) / 6 = 3.75$, preventing it from topping the catalog.
- **Mature Phase ($n \gg m$)**: As reviews accumulate, the prior weight ($m=5$) becomes negligible, allowing established reputation to dominate mathematically.
- **UI Integrity**: The interface displays the true user rating and review count (`★ 4.7 (3 reviews)`), while sorting order reflects the honest Bayesian score.

---

## 2. Concurrency-Safe Tour Bookings

### The Problem
When multiple travellers attempt to reserve the final remaining seats simultaneously (e.g. 1 seat left, 12 concurrent requests), naive read-then-write code creates a classic **Time-of-Check to Time-of-Use (TOCTOU)** race condition, causing overbooked tour slots and compromised data integrity.

### The Concurrency Protocol
To eliminate overbooking completely, every booking transaction follows a strict row-level lock protocol inside an isolated PostgreSQL transaction:

```typescript
return db.$transaction(async tx => {
  // 1. Acquire exclusive row lock on the target TourSlot record
  const slots = await tx.$queryRaw<{ id: string; capacity: number }[]>`
    SELECT id, capacity FROM "TourSlot" WHERE id = ${slotId} FOR UPDATE
  `;
  const slot = slots[0];
  if (!slot) throw new BookingError('NOT_FOUND', 'Tour slot not found.');

  // 2. Sum all existing booked seats within the lock boundary
  const booked = await tx.booking.aggregate({
    where: { slotId },
    _sum: { seats: true },
  });
  const remaining = slot.capacity - (booked._sum.seats ?? 0);

  // 3. Atomically evaluate capacity before creating the booking
  if (remaining < seats) {
    throw new BookingError('FULL', 'Not enough seats remaining for this tour.');
  }

  // 4. Insert booking and release lock on transaction commit
  return tx.booking.create({ data: { slotId, userId, seats } });
}, { timeout: 20000 });
```

### Key Concurrency Properties:
1. **Row-Level Serialization**: `SELECT ... FOR UPDATE` locks only the requested `TourSlot` row. Concurrent bookings for *different* tour slots or places proceed in parallel without blocking each other.
2. **Deterministic Rejection**: Competing transactions queue at the lock. When the first transaction commits and fills the remaining seats, subsequent transactions read the updated sum and immediately throw `BookingError('FULL')`.
3. **HTTP 409 Conflict**: Overbooking attempts return HTTP 409 with a friendly user-facing error banner rather than a crash or 500 error page.
4. **Automated Stress Testing**: Verified by `tests/booking.test.ts`, which fires 12 parallel HTTP requests against a 1-seat slot; exactly 1 request succeeds (HTTP 200) and 11 fail cleanly (HTTP 409).

---

## 3. No-Authentication Identity Model & Admin Persona

### Assessment Compliance
The Source of Truth states: *"No authentication is required. Seed three users and provide an 'acting as' UI switcher that identifies the active user to the backend (for example, via `X-User-Id`)."*

- **Frictionless Evaluation**: Avoided cumbersome third-party OAuth, credentials, or magic links. Evaluators can clone, run `bun run setup`, and immediately explore as any persona or as a guest.
- **Admin Persona**: We extended the persona switcher with an **Admin** curator (`id: 'admin'`). When active, `X-User-Id: admin` unlocks the `/admin` portal and authorizes API mutations (place creation/deletion, tour scheduling, persona management).
- **Cascade Deletion Safety**: Deleting a persona cascades through PostgreSQL relations to clean up their bookings and reviews. The Admin persona itself is permanently protected against deletion.

---

## 4. Media & Dual-Mode Object Storage

### Zero-Config Local Setup vs. Cloud Neon S3
To satisfy both the take-home's 3-command local setup requirement and real-world cloud deployment capabilities, we built a dual-mode media architecture:
1. **Local Offline Reliability**: 10 authentic, high-resolution photographs of actual Addis Ababa landmarks are bundled in `apps/web/public/places/`. They load locally with 0ms latency, zero reliance on external hotlinks, and zero risk of HTTP 429 rate limits.
2. **Neon Object Storage & S3 Compatibility**: Implemented `/api/upload` using `@aws-sdk/client-s3` configured with `forcePathStyle: true` (mandatory for Neon Object Storage and local RustFS). If S3 credentials are provided, uploads stream to cloud buckets; otherwise, the app gracefully falls back to local photography.

---

## 5. Lean Architecture: Pruning Bloat

We eliminated template bloat left over from initial scaffolds:
- **Pruned Unused Packages**: Removed `@trpc/*`, `@tanstack/react-query`, `@tanstack/react-form`, `sonner`, `next-themes`, and `babel-plugin-react-compiler`.
- **Standardized on Next.js Route Handlers**: Native route handlers (`/api/wayfarer`, `/api/admin`, `/api/upload`) provide simpler debugging, smaller bundle sizes, faster build times, and zero extra runtime abstractions.

---

## 6. With More Time

1. **Idempotency Keys**: Add an `Idempotency-Key` header generated on the client for booking requests to safeguard against network retries or fast double-clicks.
2. **Self-Service Booking Cancellations**: Allow travellers to view their active bookings and cancel reservations, returning seats to the available pool.
3. **PostgreSQL Materialized Views**: At higher scale (thousands of places and reviews), maintain rating scores and seat availability using materialized views with asynchronous refresh triggers.
4. **Image Upload Client UI**: Expose the `/api/upload` endpoint directly as a drag-and-drop file upload zone in the `/admin` place creation modal.
