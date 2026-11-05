# Decisions

## Rating Formula

Top rated uses a Bayesian weighted score `(n × average + 5 × 3.5) / (n + 5)`, where `n` is the review count. The five-review prior at 3.5 stars pulls ratings with little evidence toward a moderate baseline. As reviews accumulate, the actual average dominates. This is a deliberately simple, fixed prior rather than a claim about real traveller preferences; changing it changes the ordering. The interface displays the actual average and count, not the adjusted score. The test compares one five-star review with 312 reviews averaging 4.7.

## Concurrency-Safe Booking

Every booking transaction locks its `TourSlot` row with PostgreSQL `SELECT ... FOR UPDATE`, then sums booked seats and creates a booking only if enough capacity remains. Competing transactions for the same slot wait for the lock and read the previous committed booking before making their own decision. Slots do not block one another. Positive seat counts and capacity also have database constraints. All booking writers must use this locking protocol; a direct database insert can bypass the capacity rule. Full slots return HTTP 409 and an explanatory message.

## Media & Neon Object Storage Architecture

To support media without coupling local development to mandatory external cloud billing, we implemented a dual-mode S3 adapter using `@aws-sdk/client-s3`. Neon Object Storage requires path-style addressing (`forcePathStyle: true`) and branch-specific endpoints. When environment variables are configured, uploads stream directly to Neon Object Storage buckets. When running locally from a fresh clone without cloud credentials, the seed command attaches curated high-resolution photography so evaluators experience a visually rich application out of the box.

## With More Time

I would add client request idempotency headers for double-click protection, booking cancellations, user booking history, and accessible screen-reader navigation audits. At higher catalog scale, rating aggregates would be cached using PostgreSQL materialized views with background refreshes.
