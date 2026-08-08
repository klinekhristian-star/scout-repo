import type { Job } from "./types";

/** No demo listings — catalog is live boards + manually added jobs only. */
export const SEED_JOBS: Job[] = [];

export function mergeJobCatalog(
  seed: Job[],
  live: Job[],
  manual: Job[],
  includeSeed: boolean,
): Job[] {
  const map = new Map<string, Job>();
  const put = (j: Job) => {
    if (!j?.id) return;
    map.set(j.id, j);
  };
  if (includeSeed) for (const j of seed) put(j);
  for (const j of live) put(j);
  for (const j of manual) put(j);
  return Array.from(map.values());
}
