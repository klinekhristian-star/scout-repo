import type { Job } from "./types";

/** Fixed anchor so SSR and client render identical relative times. */
const ANCHOR = Date.parse("2026-08-08T12:00:00.000Z");

const daysAgo = (d: number) =>
  new Date(ANCHOR - d * 24 * 60 * 60 * 1000).toISOString();

export const SEED_JOBS: Job[] = [];

export function mergeJobCatalog(
  seed: Job[],
  live: Job[],
  manual: Job[],
  includeSeed: boolean,
): Job[] {
  const map = new Map<string, Job>();
  const put = (j: Job) => {
    if (!map.has(j.id)) map.set(j.id, j);
  };
  for (const j of manual) put(j);
  for (const j of live) put(j);
  if (includeSeed) for (const j of seed) put(j);
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
  );
}
