# AI Usage

## Tools Used

- **OpenAI Codex & Antigravity (Google DeepMind)**: Used across planning, codebase inspection, PostgreSQL schema migrations, Bayesian ranking algorithms, concurrency locking transactions, Framer Motion animation integration, and UI component architecture.

## Example Prompts & Iterations

1. *"Plan and modernize Wayfarer: bluish theme, remove ✳ and ↗ symbols, separate catalog and place detail pages, add an account picker with persona cards, and integrate Neon Object Storage."*
   - Used to generate the modular component architecture (`/`, `/places/[id]`, `/account`), Framer Motion staggered reveals, and S3 path-style storage client.
2. *"Prevent overbooking even under parallel requests and damp single 5-star ratings over established places."*
   - Used to create the Bayesian prior calculation `(n × average + 5 × 3.5) / (n + 5)` and the PostgreSQL `SELECT ... FOR UPDATE` row-locking transaction.

## Where AI Was Wrong or Corrected

1. **Path-Style Addressing in Neon Object Storage**: Default S3 client SDKs assume virtual-hosted bucket URLs (`bucket.s3.amazonaws.com`). Neon Object Storage strictly requires path-style addressing (`endpoint/bucket/key`). We caught this during the Neon API integration and explicitly configured `forcePathStyle: true` in `@aws-sdk/client-s3`.
2. **Single-Screen Clumping vs. Evaluation Requirements**: An earlier prototype clamped the places list and place detail into a single desktop split-screen, routing `/places/[id]` back to the same view. This was flagged during manual inspection as violating the multi-page requirement ("A list page ... A detail page for each place"). We restructured the routing into separate, dedicated routes (`/`, `/places/[id]`, and `/account`).
