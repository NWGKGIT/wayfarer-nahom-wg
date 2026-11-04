# AI usage

OpenAI Codex was used to inspect the take-home brief and starter project, discuss choices, and implement the schema, booking transaction, interface, tests, and documentation. The requested scope and database restrictions were provided by the user; the implementation should be reviewed and understood before submission.

Examples of prompts: “build using SOURCE_OF_TRUTH.md and Wayfarer_Intern_Take_Home.pdf … use supabase strictly as a managed database … use prisma + postgre” and the approved implementation plan requesting a Bayesian ranking and a row-locked booking transaction. Codex used those instructions to replace the starter authentication stack and build the app around PostgreSQL.

One generated approach was unhelpful: the starter's Varlock Next.js integration caused Prisma generation to terminate without producing a client after the authentication configuration changed. This was noticed by checking for the generated client; the unused integration was removed and Prisma generation was rerun. A later Next.js TypeScript CLI failure was caught by running the production build and addressed by using Next's TypeScript API. Ranking and type checks were run; the database integration test still needs separate PostgreSQL credentials, so its result is not claimed as verified.
