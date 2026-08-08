import type {
  ActivityEvent,
  Application,
  InterviewStory,
  Job,
  JobBoardSettings,
  Profile,
  SearchAgent,
} from "@/data/types";

export const BACKUP_VERSION = 1 as const;

export interface ScoutBackup {
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  app: "scout";
  profile: Profile;
  boardSettings: JobBoardSettings;
  agents: SearchAgent[];
  applications: Application[];
  stories: InterviewStory[];
  activity: ActivityEvent[];
  liveJobs: Job[];
  manualJobs: Job[];
  lastSyncAt?: string;
}

export function buildScoutBackup(state: {
  profile: Profile;
  boardSettings: JobBoardSettings;
  agents: SearchAgent[];
  applications: Application[];
  stories: InterviewStory[];
  activity: ActivityEvent[];
  liveJobs: Job[];
  manualJobs: Job[];
  lastSyncAt?: string;
}): ScoutBackup {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    app: "scout",
    profile: state.profile,
    boardSettings: state.boardSettings,
    agents: state.agents,
    applications: state.applications,
    stories: state.stories,
    activity: state.activity.slice(0, 200),
    liveJobs: state.liveJobs,
    manualJobs: state.manualJobs,
    lastSyncAt: state.lastSyncAt,
  };
}

export function downloadBackup(backup: ScoutBackup) {
  const day = backup.exportedAt.slice(0, 10);
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `scout-backup-${day}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadCsvExport(applications: Application[], jobs: Job[]) {
  const byId = new Map(jobs.map((j) => [j.id, j]));
  const rows: string[][] = [
    [
      "job_id",
      "title",
      "company",
      "stage",
      "match_score",
      "applied_at",
      "updated_at",
      "referral_path",
      "outreach_count",
      "url",
      "notes",
    ],
  ];
  for (const a of applications) {
    const j = byId.get(a.jobId);
    rows.push([
      a.jobId,
      j?.title ?? "",
      j?.company ?? "",
      a.stage,
      String(a.matchScore),
      a.appliedAt ?? "",
      a.updatedAt,
      a.referralPath ?? "",
      String(a.outreach?.length ?? 0),
      j?.url ?? "",
      (a.notes ?? "").replace(/\n/g, " "),
    ]);
  }
  const esc = (c: string) => `"${c.replace(/"/g, '""')}"`;
  const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `scout-pipeline-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseScoutBackup(raw: unknown): ScoutBackup {
  if (!raw || typeof raw !== "object") throw new Error("Invalid backup file");
  const o = raw as Partial<ScoutBackup>;
  if (o.app !== "scout") throw new Error("Not a Scout backup");
  if (!o.profile || !Array.isArray(o.applications)) {
    throw new Error("Backup missing profile or applications");
  }
  return {
    version: BACKUP_VERSION,
    exportedAt: o.exportedAt ?? new Date().toISOString(),
    app: "scout",
    profile: o.profile,
    boardSettings: o.boardSettings as JobBoardSettings,
    agents: Array.isArray(o.agents) ? o.agents : [],
    applications: o.applications,
    stories: Array.isArray(o.stories) ? o.stories : [],
    activity: Array.isArray(o.activity) ? o.activity : [],
    liveJobs: Array.isArray(o.liveJobs) ? o.liveJobs : [],
    manualJobs: Array.isArray(o.manualJobs) ? o.manualJobs : [],
    lastSyncAt: o.lastSyncAt,
  };
}
