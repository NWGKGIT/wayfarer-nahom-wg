import { afterAll, beforeAll, expect, test } from 'bun:test';
import { createPrismaClient } from '../packages/db/src/index';
import { randomUUID } from 'node:crypto';
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';

const url = process.env.TEST_DATABASE_URL;
const id = `test-${randomUUID()}`;
let db: ReturnType<typeof createPrismaClient>;
let server: ChildProcess | undefined;
const origin = 'http://127.0.0.1:31987';
beforeAll(async () => {
  if (!url) throw new Error('Set TEST_DATABASE_URL to a separate PostgreSQL test database.');
  const target = (value: string) => { const parsed = new URL(value); return `${parsed.hostname}:${parsed.port || '5432'}${parsed.pathname}`; };
  if (process.env.DATABASE_URL && target(url) === target(process.env.DATABASE_URL)) throw new Error('TEST_DATABASE_URL must point to a separate database.');
  const migration = spawnSync('packages/db/node_modules/.bin/prisma', ['migrate', 'deploy', '--config', 'packages/db/prisma.config.ts'], { env: { ...process.env, DATABASE_URL: url }, encoding: 'utf8' });
  if (migration.status !== 0) throw new Error(`Test database migration failed: ${migration.stderr}`);
  db = createPrismaClient({ DATABASE_URL: url });
  await db.user.create({ data: { id, name: 'Test traveller' } });
  await db.place.create({ data: { id, name: 'Test place', category: 'Test', description: 'Test', openingHours: 'Test' } });
  await db.tourSlot.create({ data: { id, placeId: id, startsAt: new Date(), capacity: 10 } });
  await db.booking.create({ data: { slotId: id, userId: id, seats: 9 } });
  server = spawn('bun', ['run', '--cwd', 'apps/web', 'dev', '--port', '31987'], { env: { ...process.env, DATABASE_URL: url }, stdio: 'ignore' });
  for (let i = 0; i < 120; i++) {
    if (server.exitCode !== null) throw new Error('Test server exited before it was ready.');
    try { if ((await fetch(`${origin}/api/wayfarer`)).ok) return; } catch {}
    await Bun.sleep(500);
  }
  throw new Error('Test server did not start.');
}, 90000);
afterAll(async () => {
  server?.kill();
  if (db) { await db.place.deleteMany({ where: { id } }); await db.user.deleteMany({ where: { id } }); await db.$disconnect(); }
});
test('parallel booking requests cannot exceed capacity', async () => {
  const responses = await Promise.all(Array.from({ length: 12 }, () => fetch(`${origin}/api/wayfarer`, { method: 'POST', headers: { 'content-type': 'application/json', 'X-User-Id': id }, body: JSON.stringify({ type: 'booking', slotId: id, seats: 1 }) })));
  expect(responses.filter(r => r.status === 200)).toHaveLength(1);
  expect(responses.filter(r => r.status === 409)).toHaveLength(11);
  const full = await responses.find(r => r.status === 409)!.json();
  expect(full.error).toContain('seats');
  const total = await db.booking.aggregate({ where: { slotId: id }, _sum: { seats: true } });
  expect(total._sum.seats).toBe(10);
}, 60000);
