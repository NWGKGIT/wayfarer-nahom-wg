import { createPrismaClient } from '@wayfer-assesment/db';
const globalDb = globalThis as unknown as { wayfarerDb?: ReturnType<typeof createPrismaClient> };
export const db = globalDb.wayfarerDb ?? createPrismaClient({ DATABASE_URL: process.env.DATABASE_URL! });
if (process.env.NODE_ENV !== 'production') globalDb.wayfarerDb = db;
