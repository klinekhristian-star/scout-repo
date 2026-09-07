import type { Job, JobBoardSettings, SearchAgent } from "@/data/types";
import { defaultAtsTargets } from "@/lib/job-boards/ats";
import { TOGGLE_BOARD_IDS, type ToggleBoardId } from "@/lib/job-boards/meta";
import {
  DEFAULT_BOARD_QUERY,
  defaultScoutProfile,
  defaultSearchAgents,
} from "@/data/resume-tracks";

export const defaultProfile = defaultScoutProfile();

export const defaultBoardSettings: JobBoardSettings = {
  remotive: true,
  arbeitnow: true,
  remoteok: true,
  jobicy: true,
  himalayas: true,
  themuse: true,
  weworkremotely: true,
  adzuna: false,
  adzunaAppId: "",
  adzunaAppKey: "",
  adzunaCountry: "us",
  includeSeedJobs: false,
  defaultQuery: DEFAULT_BOARD_QUERY,
  atsEnabled: false,
  atsTargets: defaultAtsTargets(),
};

export function mergeBoardSettings(
  partial?: Partial<JobBoardSettings> | null,
): JobBoardSettings {
  const base = { ...defaultBoardSettings, ...(partial ?? {}) };
  base.atsTargets = Array.isArray(partial?.atsTargets)
    ? partial!.atsTargets
    : Array.isArray(base.atsTargets)
      ? base.atsTargets
      : defaultAtsTargets();
  base.atsEnabled =
    typeof partial?.atsEnabled === "boolean"
      ? partial.atsEnabled
      : typeof base.atsEnabled === "boolean"
        ? base.atsEnabled
        : false;
  base.includeSeedJobs = false;
  return base;
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

export function emptyAgents(): SearchAgent[] {
  return defaultSearchAgents();
}

export function emptyApplications() {
  return [];
}

export function emptyActivity() {
  return [];
}

export function emptyStories() {
  return [];
}

export function enabledBoards(settings: JobBoardSettings): ToggleBoardId[] {
  return TOGGLE_BOARD_IDS.filter((id) => settings[id]);
}

export function sameJobUrl(a: string, b: string): boolean {
  try {
    const ua = new URL(a);
    const ub = new URL(b);
    return (
      ua.hostname.replace(/^www\./, "") === ub.hostname.replace(/^www\./, "") &&
      ua.pathname.replace(/\/$/, "") === ub.pathname.replace(/\/$/, "")
    );
  } catch {
    return a === b;
  }
}
