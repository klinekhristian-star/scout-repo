import type { Application, Job, OutreachEntry } from "@/data/types";
import { scoreJob } from "@/lib/matching";
import type { Profile } from "@/data/types";

export type DueItemKind =
  | "follow_up"
  | "stale_app"
  | "high_match"
  | "interview_prep";

export interface DueItem {
  id: string;
  kind: DueItemKind;
  priority: number; // lower = more urgent
  title: string;
  detail: string;
  jobId: string;
  job?: Job;
  applicationId?: string;
  outreachId?: string;
  badge: string;
}

const STALE_DAYS = 7;
const HIGH_MATCH = 80;

function daysSince(iso: string): number {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return 0;
  return Math.floor((Date.now() - t) / (24 * 60 * 60 * 1000));
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function buildDueToday(opts: {
  applications: Application[];
  catalog: Job[];
  profile: Profile;
  /** Job IDs already in pipeline — high matches exclude these */
  maxHighMatches?: number;
}): DueItem[] {
  const {
    applications,
    catalog,
    profile,
    maxHighMatches = 5,
  } = opts;
  const today = todayIsoDate();
  const byId = new Map(catalog.map((j) => [j.id, j]));
  const inPipeline = new Set(applications.map((a) => a.jobId));
  const items: DueItem[] = [];

  // 1) Outreach follow-ups due
  for (const app of applications) {
    const job = byId.get(app.jobId);
    for (const o of app.outreach ?? []) {
      if (o.status === "closed") continue;
      if (!o.nextFollowUp) continue;
      const due = o.nextFollowUp.slice(0, 10);
      if (due > today) continue;
      const overdueDays = daysSince(due + "T12:00:00.000Z");
      items.push({
        id: `fu-${o.id}`,
        kind: "follow_up",
        priority: overdueDays > 0 ? 0 : 1,
        title: `Follow up: ${o.contactName}`,
        detail: `${job ? `${job.title} · ${job.company}` : "Role"} · ${o.channel} · ${o.status}${
          overdueDays > 0 ? ` · ${overdueDays}d overdue` : " · due today"
        }`,
        jobId: app.jobId,
        job,
        applicationId: app.id,
        outreachId: o.id,
        badge: overdueDays > 0 ? "Overdue" : "Follow-up",
      });
    }
  }

  // 2) Stale applications (no update in STALE_DAYS, still active)
  const activeStages = new Set([
    "saved",
    "applied",
    "phone",
    "interview",
  ]);
  for (const app of applications) {
    if (!activeStages.has(app.stage)) continue;
    const age = daysSince(app.updatedAt);
    if (age < STALE_DAYS) continue;
    const job = byId.get(app.jobId);
    items.push({
      id: `stale-${app.id}`,
      kind: "stale_app",
      priority: 2,
      title: job ? `${job.title} @ ${job.company}` : "Stale application",
      detail: `No touch in ${age} days · stage: ${app.stage}`,
      jobId: app.jobId,
      job,
      applicationId: app.id,
      badge: "Stale",
    });
  }

  // 3) Interview prep (in phone/interview stages)
  for (const app of applications) {
    if (app.stage !== "phone" && app.stage !== "interview") continue;
    const job = byId.get(app.jobId);
    items.push({
      id: `iv-${app.id}`,
      kind: "interview_prep",
      priority: 1,
      title: job
        ? `Prep interview: ${job.title}`
        : "Interview prep",
      detail: `${job?.company ?? "Company"} · open interview kit + story bank`,
      jobId: app.jobId,
      job,
      applicationId: app.id,
      badge: app.stage === "interview" ? "Interview" : "Phone",
    });
  }

  // 4) New high matches not yet in pipeline
  const highs = catalog
    .filter((j) => !inPipeline.has(j.id))
    .map((j) => ({ job: j, score: scoreJob(j, profile).score }))
    .filter((x) => x.score >= HIGH_MATCH)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxHighMatches);

  for (const { job, score } of highs) {
    items.push({
      id: `hm-${job.id}`,
      kind: "high_match",
      priority: 3,
      title: `${job.title} @ ${job.company}`,
      detail: `${score}% match · not in pipeline yet`,
      jobId: job.id,
      job,
      badge: `${score}%`,
    });
  }

  // Dedupe by id, sort by priority then title
  const seen = new Set<string>();
  return items
    .filter((i) => {
      if (seen.has(i.id)) return false;
      seen.add(i.id);
      return true;
    })
    .sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title));
}

export function dueKindLabel(kind: DueItemKind): string {
  switch (kind) {
    case "follow_up":
      return "Follow-up";
    case "stale_app":
      return "Stale app";
    case "high_match":
      return "High match";
    case "interview_prep":
      return "Interview";
  }
}

/** Count follow-ups only (for stat chips) */
export function countFollowUpsDue(
  applications: Application[],
  outreachFilter?: (o: OutreachEntry) => boolean,
): number {
  const today = todayIsoDate();
  let n = 0;
  for (const a of applications) {
    for (const o of a.outreach ?? []) {
      if (o.status === "closed") continue;
      if (!o.nextFollowUp) continue;
      if (o.nextFollowUp.slice(0, 10) > today) continue;
      if (outreachFilter && !outreachFilter(o)) continue;
      n++;
    }
  }
  return n;
}
