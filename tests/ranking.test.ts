import { expect, test } from 'bun:test';
import { rankingScore } from '../packages/db/src/wayfarer';
test('a single perfect review does not beat a strong, established rating', () => {
  expect(rankingScore(4.7, 312)).toBeGreaterThan(rankingScore(5, 1));
  expect(rankingScore(0, 0)).toBe(3.5);
  expect(rankingScore(5, 10)).toBeGreaterThan(rankingScore(5, 1));
});
