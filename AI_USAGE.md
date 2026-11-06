# AI Usage

This document transparently outlines how AI tools were utilized throughout the development of Wayfarer, including specific prompts, architectural iterations, and concrete examples where AI output was incorrect and corrected.

---

## 1. Tools Used

- **Google Antigravity & DeepMind Advanced Coding Agent**: Primary pair-programming assistant used for codebase exploration, multi-page routing restructuring, Bayesian ranking math verification, PostgreSQL concurrency-locking transactions, Framer Motion animations, and editorial design system implementation.
- **Anthropic Claude & OpenAI Models**: Consulted during early brainstorming for ranking priors, Docker Compose service definitions, and TypeScript Zod schema validations.

---

## 2. Example Prompts & How Output Was Used

### Prompt 1: Bayesian Honest Ranking & Concurrency-Safe Booking
> *"Prevent overbooking even under parallel requests and damp single 5-star ratings over established places. Follow the take-home Source of Truth strictly."*
- **Output & Application**: The AI proposed a Bayesian m-estimate formula `(n * avg + 5 * 3.5) / (n + 5)` with a 5-review prior at 3.5 stars, and a PostgreSQL transaction using `SELECT ... FOR UPDATE` row-level locks on the `TourSlot` record.
- **Verification**: We wrote automated unit and integration tests (`tests/ranking.test.ts` and `tests/booking.test.ts`) that proved a single 5-star rating (score 3.75) cannot beat 312 reviews at 4.7 (score 4.68), and that 12 simultaneous booking attempts against a 1-seat slot yield exactly 1 success (HTTP 200) and 11 conflicts (HTTP 409).

### Prompt 2: Modern Editorial Blue Theming & De-clumped Multi-Page Routing
> *"De-clump the app into dedicated routes (/ catalog, /places/[id] detail, /account persona picker), theme in royal blue with DM Serif Display + DM Sans, remove all ✳ and arrow glyphs, and add an Admin persona to curate places, tours, and personas."*
- **Output & Application**: The AI generated Next.js App Router pages (`app/page.tsx`, `app/places/[id]/page.tsx`, `app/account/page.tsx`, `app/admin/page.tsx`), a shared `UserContext` with local storage persistence, and an editorial design system using custom CSS rather than generic component libraries.

---

## 3. Where AI Was Wrong or Unhelpful, and How It Was Handled

### 1. MinIO Docker Image Pull Failure
- **Issue**: The AI initially configured `minio/minio:latest` in `docker-compose.yml`. Running `docker compose up -d` failed with:
  `Error response from daemon: pull access denied for minio/minio, repository does not exist or may require 'docker login'`.
- **Diagnosis & Fix**: Docker Hub restricted or rate-limited the unauthenticated pull of `minio/minio:latest`. We caught this immediately during local testing and replaced it with **RustFS** (`rustfs/rustfs:latest`), an ultra-lightweight, zero-auth, S3-compatible object storage server on port 9000 that starts instantly in under 1 second without docker login.

### 2. S3 Virtual-Hosted vs. Path-Style Addressing
- **Issue**: The AI initialized `@aws-sdk/client-s3` using default AWS configuration. Default S3 clients attempt virtual-hosted bucket URLs (`https://<bucket>.<endpoint>`), which fails with Neon Object Storage and local S3 emulators.
- **Diagnosis & Fix**: Neon Object Storage and local RustFS strictly require path-style addressing (`https://<endpoint>/<bucket>/<key>`). We diagnosed the connection failures and explicitly passed `forcePathStyle: true` to `S3Client`, ensuring seamless compatibility with both remote Neon and local RustFS.

### 3. Omission of Search Bar and Animations on Layout Revert
- **Issue**: When asked to revert back from a generic Tailwind card design to the classic serif editorial layout, the AI inadvertently dropped the client-side search input and Framer Motion stagger animations from `page.tsx`.
- **Diagnosis & Fix**: We identified that the search bar had disappeared during manual review. We re-implemented the search input inside `.catalog-toolbar` with instant client-side filtering across place names, descriptions, and categories, dynamic result count indicators, empty search state fallbacks, and Framer Motion layout animations.

### 4. Review Form Pre-Population & Clear Behavior
- **Issue**: An early AI iteration pre-populated previous reviews into the review form textarea and failed to clear the textarea upon successful submission, confusing users about whether their review had been submitted.
- **Diagnosis & Fix**: We refactored `app/places/[id]/page.tsx` so the review form starts completely blank (`body = ''`) with an inviting placeholder, and upon receiving HTTP 200, it clears the textarea, resets the rating to 5 stars, and triggers an immediate place refresh.

### 5. Inaccurate External Image Stubs
- **Issue**: The AI originally seeded generic Unsplash photos with hotlinks that intermittently hit HTTP 429 rate limits or failed offline.
- **Diagnosis & Fix**: We downloaded authentic, high-resolution photographs of the actual Addis Ababa landmarks directly into `apps/web/public/places/` and updated the Prisma seed script and API fallback logic to serve local images with 0ms latency and 100% offline reliability.
