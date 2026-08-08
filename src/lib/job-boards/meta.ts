import type { JobBoardId, JobBoardSettings } from "@/data/types";

/** Public boards that map 1:1 to boolean flags on JobBoardSettings (excludes `ats`). */
export type ToggleBoardId = Exclude<JobBoardId, "ats">;

export const TOGGLE_BOARD_IDS: ToggleBoardId[] = [
  "remotive",
  "arbeitnow",
  "remoteok",
  "jobicy",
  "himalayas",
  "themuse",
  "weworkremotely",
  "adzuna",
];

export const BOARD_LABELS: Record<JobBoardId, string> = {
  remotive: "Remotive",
  arbeitnow: "Arbeitnow",
  remoteok: "RemoteOK",
  jobicy: "Jobicy",
  himalayas: "Himalayas",
  themuse: "The Muse",
  weworkremotely: "We Work Remotely",
  adzuna: "Adzuna",
  ats: "Company ATS",
};

export function isBoardEnabled(
  settings: JobBoardSettings,
  id: ToggleBoardId,
): boolean {
  return Boolean(settings[id]);
}
