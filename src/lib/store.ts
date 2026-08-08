import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEED_JOBS, mergeJobCatalog } from "@/data/jobs";
import type {
  ActivityEvent,
  Application,
  ApplicationStage,
  BoardSyncStatus,
  Job,
  JobBoardSettings,
  Profile,
  SearchAgent,
  WorkMode,
  Seniority,
} from "@/data/types";
import { defaultAtsTargets } from "@/lib/job-boards/ats";
import { TOGGLE_BOARD_IDS, type ToggleBoardId } from "@/lib/job-boards/meta";
import { generateCoverLetter, jobMatchesAgent, scoreJob } from "@/lib/matching";
import { syncJobBoards } from "@/server/job-boards";

/** Profile seeded from Khristian Kline executive resume (GTM / MarTech / CX). */
const defaultProfile: Profile = {
  name: "Khristian Kline",
  email: "klinekhristian@gmail.com",
  headline:
    "Enterprise Go-to-Market Executive · Customer Engagement · Marketing Technology",
  location: "Charleston, SC",
  openToRemote: true,
  openToHybrid: true,
  openToOnsite: true,
  targetTitles: [
    "VP Go-to-Market",
    "VP Customer Engagement",
    "Senior Director Digital Engagement",
    "Head of Marketing Technology",
    "VP Customer Success",
    "Executive Advisor GTM",
    "Director Virtual Events",
    "Principal GTM Strategy",
    "VP Revenue Marketing",
    "Managing Director Digital Transformation",
  ],
  skills: [
    "Go-to-Market Strategy",
    "Digital Experience Optimization",
    "Customer Journey Design",
    "Enterprise Customer Engagement",
    "Virtual Events",
    "Webinars",
    "Customer Acquisition",
    "Learner Acquisition",
    "Retention Strategy",
    "Revenue Growth",
    "Marketing Technology",
    "Salesforce",
    "Marketo",
    "Eloqua",
    "SSO",
    "Competitive Intelligence",
    "Web Maturity Assessments",
    "Executive Advisory",
    "Stakeholder Management",
    "Strategic Partnerships",
    "Sponsorship Development",
    "Cross-Functional Leadership",
    "Program Delivery",
    "Executive Analytics",
    "Enterprise SaaS",
  ],
  yearsExperience: 25,
  salaryMin: 180000,
  preferredLocations: [
    "Remote",
    "Charleston",
    "South Carolina",
    "Charlotte",
    "Atlanta",
    "Southeast",
    "New York",
  ],
  resumeSummary:
    "Enterprise go-to-market executive with 25+ years leading digital customer engagement—from Silicon Alley through enterprise SaaS (nearly 15 years at ON24 advising Microsoft, Home Depot, Dell, SAP, IBM, Lenovo, Citibank, Merck) to founding GTM Insights Group. Known for aligning GTM strategy, customer experience, marketing technology, and executive decision-making to grow accounts from initial engagement to multi-million-dollar programs. Open to relocation and remote.",
  autoSaveMatchesAbove: 75,
  notifyOnNewMatches: true,
};

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
  includeSeedJobs: true,
  defaultQuery: "go-to-market customer engagement marketing technology",
  atsEnabled: true,
  atsTargets: defaultAtsTargets(),
};

function mergeBoardSettings(
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
        : true;
  return base;
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

const SEED_NOW = Date.parse("2026-08-07T08:00:00.000Z");
const hoursAgo = (h: number) =>
  new Date(SEED_NOW - h * 60 * 60 * 1000).toISOString();
const daysAgo = (d: number) =>
  new Date(SEED_NOW - d * 24 * 60 * 60 * 1000).toISOString();

function seedAgents(): SearchAgent[] {
  const now = hoursAgo(0);
  return [
    {
      id: "agent-1",
      name: "Enterprise GTM & Engagement leadership",
      query: "go-to-market customer engagement enterprise digital",
      locations: ["Remote", "Charleston", "Atlanta", "Charlotte", "New York"],
      workModes: ["remote", "hybrid"],
      seniorities: ["director", "lead", "staff"],
      salaryMin: 170000,
      skills: ["Go-to-Market Strategy", "Customer Engagement", "Enterprise SaaS"],
      sources: [],
      frequency: "daily",
      enabled: true,
      minMatchScore: 65,
      autoSave: true,
      createdAt: now,
      lastRunAt: hoursAgo(3),
      lastMatchCount: 4,
      totalMatches: 12,
    },
    {
      id: "agent-2",
      name: "MarTech · Virtual Events · CX",
      query: "marketing technology virtual events webinar customer experience",
      locations: ["Remote"],
      workModes: ["remote", "hybrid"],
      seniorities: ["director", "lead", "senior"],
      salaryMin: 160000,
      skills: ["Marketing Technology", "Virtual Events", "Salesforce", "Marketo"],
      sources: [],
      frequency: "daily",
      enabled: true,
      minMatchScore: 60,
      autoSave: true,
      createdAt: now,
      lastRunAt: hoursAgo(1),
      lastMatchCount: 3,
      totalMatches: 8,
    },
    {
      id: "agent-3",
      name: "Executive advisory & GTM consulting",
      query: "executive advisor principal consultant GTM strategy transformation",
      locations: ["Remote", "Southeast", "Charleston"],
      workModes: ["remote", "hybrid"],
      seniorities: ["director", "lead"],
      salaryMin: 160000,
      skills: ["Executive Advisory", "Competitive Intelligence", "GTM Strategy"],
      sources: [],
      frequency: "weekly",
      enabled: true,
      minMatchScore: 60,
      autoSave: false,
      createdAt: now,
      lastMatchCount: 2,
      totalMatches: 5,
    },
    {
      id: "agent-4",
      name: "Customer Success & enterprise growth",
      query: "customer success enterprise account growth VP director",
      locations: ["Remote"],
      workModes: ["remote", "hybrid"],
      seniorities: ["director", "lead"],
      salaryMin: 175000,
      skills: ["Customer Success", "Enterprise Accounts", "Revenue Growth"],
      sources: [],
      frequency: "weekly",
      enabled: false,
      minMatchScore: 65,
      autoSave: false,
      createdAt: now,
      lastMatchCount: 0,
      totalMatches: 1,
    },
  ];
}

function seedApplications(): Application[] {
  return [
    {
      id: "app-1",
      jobId: "seed-gtm-2",
      stage: "interview",
      matchScore: 92,
      notes: "Strong GTM fit — prep Microsoft/Home Depot account stories.",
      appliedAt: daysAgo(10),
      updatedAt: daysAgo(1),
      source: "manual",
    },
    {
      id: "app-2",
      jobId: "seed-gtm-1",
      stage: "applied",
      matchScore: 90,
      notes: "Digital engagement director role — ON24 path maps cleanly.",
      appliedAt: daysAgo(3),
      updatedAt: daysAgo(3),
      source: "agent",
      agentId: "agent-1",
    },
    {
      id: "app-3",
      jobId: "seed-gtm-5",
      stage: "phone",
      matchScore: 94,
      notes: "Advisory track — aligns with GTM Insights Group work.",
      appliedAt: daysAgo(5),
      updatedAt: daysAgo(2),
      source: "agent",
      agentId: "agent-3",
    },
    {
      id: "app-4",
      jobId: "seed-gtm-3",
      stage: "saved",
      matchScore: 86,
      notes: "MarTech leadership — Salesforce/Marketo/Eloqua depth.",
      updatedAt: hoursAgo(12),
      source: "agent",
      agentId: "agent-2",
    },
    {
      id: "app-5",
      jobId: "seed-gtm-4",
      stage: "saved",
      matchScore: 91,
      notes: "Enterprise account growth — similar to ON24 strategic events.",
      updatedAt: hoursAgo(6),
      source: "agent",
      agentId: "agent-1",
    },
    {
      id: "app-6",
      jobId: "seed-gtm-6",
      stage: "rejected",
      matchScore: 72,
      notes: "More ops-heavy virtual events than strategic advisory.",
      appliedAt: daysAgo(20),
      updatedAt: daysAgo(8),
      source: "manual",
    },
  ];
}

function seedActivity(): ActivityEvent[] {
  return [
    {
      id: "act-1",
      type: "agent_run",
      title: "Agent “MarTech · Virtual Events · CX” ran",
      detail: "3 new matches above threshold",
      createdAt: hoursAgo(1),
    },
    {
      id: "act-2",
      type: "match_found",
      title: "High match: VP, Digital Customer Engagement",
      detail: "90% match · auto-saved",
      createdAt: hoursAgo(1),
    },
    {
      id: "act-3",
      type: "stage_changed",
      title: "Moved Senior Director, Go-to-Market Strategy to Interview",
      createdAt: daysAgo(1),
    },
    {
      id: "act-4",
      type: "agent_run",
      title: "Agent “Enterprise GTM & Engagement leadership” ran",
      detail: "4 matches found",
      createdAt: hoursAgo(3),
    },
    {
      id: "act-5",
      type: "application_created",
      title: "Saved Atlas Engage VP Customer Success role",
      detail: "91% match from agent",
      createdAt: hoursAgo(6),
    },
    {
      id: "act-6",
      type: "profile_updated",
      title: "Profile loaded from Khristian Kline resume",
      detail: "GTM · customer engagement · MarTech · executive advisory",
      createdAt: hoursAgo(0),
    },
  ];
}

function enabledBoards(settings: JobBoardSettings): ToggleBoardId[] {
  return TOGGLE_BOARD_IDS.filter((id) => settings[id]);
}

function sameJobUrl(a: string, b: string): boolean {
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

interface JobStore {
  profile: Profile;
  boardSettings: JobBoardSettings;
  liveJobs: Job[];
  manualJobs: Job[];
  boardStatuses: BoardSyncStatus[];
  lastSyncAt?: string;
  syncing: boolean;
  agents: SearchAgent[];
  applications: Application[];
  activity: ActivityEvent[];
  runningAgentId: string | null;
  hydrated: boolean;

  getCatalog: () => Job[];
  getJobById: (id: string) => Job | undefined;

  setProfile: (partial: Partial<Profile>) => void;
  setBoardSettings: (partial: Partial<JobBoardSettings>) => void;
  syncBoards: (opts?: { query?: string; location?: string }) => Promise<{
    count: number;
    errors: string[];
  }>;

  addManualJob: (job: Job) => { job: Job; already: boolean };
  removeManualJob: (jobId: string) => void;
  updateManualJob: (jobId: string, partial: Partial<Job>) => void;
  patchCatalogJob: (jobId: string, partial: Partial<Job>) => void;

  addAgent: (
    input: Omit<
      SearchAgent,
      "id" | "createdAt" | "lastMatchCount" | "totalMatches"
    >,
  ) => string;
  updateAgent: (id: string, partial: Partial<SearchAgent>) => void;
  deleteAgent: (id: string) => void;
  runAgent: (id: string) => Promise<{ newMatches: number; autoSaved: number }>;
  runAllAgents: () => Promise<{ agents: number; newMatches: number }>;

  saveJob: (jobId: string, source?: "manual" | "agent", agentId?: string) => void;
  applyToJob: (jobId: string, coverLetter?: string) => void;
  setStage: (applicationId: string, stage: ApplicationStage) => void;
  updateApplication: (
    applicationId: string,
    partial: Partial<Application>,
  ) => void;
  removeApplication: (applicationId: string) => void;
  getApplicationForJob: (jobId: string) => Application | undefined;
  pushActivity: (event: Omit<ActivityEvent, "id" | "createdAt">) => void;
  resetDemo: () => void;
}

function push(
  list: ActivityEvent[],
  event: Omit<ActivityEvent, "id" | "createdAt">,
): ActivityEvent[] {
  return [
    {
      ...event,
      id: uid("act"),
      createdAt: new Date().toISOString(),
    },
    ...list,
  ].slice(0, 80);
}

function matchAgentAgainstCatalog(
  agent: SearchAgent,
  profile: Profile,
  catalog: Job[],
  existingJobIds: Set<string>,
) {
  let newMatches = 0;
  let autoSaved = 0;
  const newApps: Application[] = [];
  const events: ActivityEvent[] = [];
  const seen = new Set(existingJobIds);

  for (const job of catalog) {
    if (!jobMatchesAgent(job, agent, profile)) continue;
    const match = scoreJob(job, profile);
    if (match.score < agent.minMatchScore) continue;
    if (seen.has(job.id)) continue;

    newMatches++;
    if (agent.autoSave || match.score >= profile.autoSaveMatchesAbove) {
      autoSaved++;
      seen.add(job.id);
      newApps.push({
        id: uid("app"),
        jobId: job.id,
        stage: "saved",
        matchScore: match.score,
        notes: `Auto-saved by agent “${agent.name}”`,
        updatedAt: new Date().toISOString(),
        source: "agent",
        agentId: agent.id,
        coverLetter: generateCoverLetter(job, profile),
      });
      events.push({
        id: uid("act"),
        type: "match_found",
        title: `Match: ${job.title} at ${job.company}`,
        detail: `${match.score}% · ${job.source} · saved by “${agent.name}”`,
        createdAt: new Date().toISOString(),
      });
    } else {
      events.push({
        id: uid("act"),
        type: "match_found",
        title: `Match found: ${job.title}`,
        detail: `${match.score}% · ${job.source} · not auto-saved`,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return { newMatches, autoSaved, newApps, events, seen };
}

export const useJobStore = create<JobStore>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      boardSettings: defaultBoardSettings,
      liveJobs: [],
      manualJobs: [],
      boardStatuses: [],
      lastSyncAt: undefined,
      syncing: false,
      agents: seedAgents(),
      applications: seedApplications(),
      activity: seedActivity(),
      runningAgentId: null,
      hydrated: false,

      getCatalog: () => {
        const s = get();
        return mergeJobCatalog(
          SEED_JOBS,
          s.liveJobs,
          s.manualJobs,
          s.boardSettings.includeSeedJobs,
        );
      },

      getJobById: (id) => get().getCatalog().find((j) => j.id === id),

      setProfile: (partial) => {
        set((s) => ({
          profile: { ...s.profile, ...partial },
          activity: push(s.activity, {
            type: "profile_updated",
            title: "Profile preferences updated",
            detail: "Match scores will refresh automatically",
          }),
        }));
      },

      setBoardSettings: (partial) => {
        set((s) => ({
          boardSettings: mergeBoardSettings({
            ...s.boardSettings,
            ...partial,
          }),
        }));
      },

      syncBoards: async (opts) => {
        const state = get();
        if (state.syncing) return { count: 0, errors: ["Sync already running"] };
        set({ syncing: true });
        const boards = enabledBoards(state.boardSettings);
        const query =
          opts?.query?.trim() ||
          state.boardSettings.defaultQuery ||
          state.profile.targetTitles.slice(0, 3).join(" ");
        const location =
          opts?.location?.trim() ||
          (state.profile.openToRemote ? "Remote" : state.profile.location);

        try {
          const result = await syncJobBoards({
            data: {
              boards,
              query,
              location,
              limit: 40,
              adzunaAppId: state.boardSettings.adzunaAppId,
              adzunaAppKey: state.boardSettings.adzunaAppKey,
              adzunaCountry: state.boardSettings.adzunaCountry,
              atsEnabled: state.boardSettings.atsEnabled,
              atsTargets: state.boardSettings.atsTargets,
              atsLimit: 16,
            },
          });

          const incoming = result.jobs ?? [];
          const statuses: BoardSyncStatus[] = (result.results ?? []).map(
            (st) => ({
              board: st.board,
              ok: !st.error,
              count: st.jobs?.length ?? 0,
              error: st.error,
              fetchedAt: st.fetchedAt,
              label: st.label,
            }),
          );

          set((s) => {
            const byUrl = new Map(s.liveJobs.map((j) => [j.url, j]));
            for (const j of incoming) {
              const existing = [...byUrl.values()].find((x) =>
                sameJobUrl(x.url, j.url),
              );
              if (existing) {
                byUrl.set(existing.url, { ...existing, ...j, id: existing.id });
              } else {
                byUrl.set(j.url, j);
              }
            }
            const liveJobs = Array.from(byUrl.values()).slice(0, 400);
            return {
              liveJobs,
              boardStatuses: statuses,
              lastSyncAt: new Date().toISOString(),
              syncing: false,
              activity: push(s.activity, {
                type: "boards_synced",
                title: `Synced ${incoming.length} roles from boards`,
                detail: statuses
                  .filter((x) => x.ok)
                  .map((x) => `${x.label ?? x.board}: ${x.count}`)
                  .slice(0, 6)
                  .join(" · "),
              }),
            };
          });

          const errors = statuses
            .filter((x) => !x.ok && x.error)
            .map((x) => `${x.board}: ${x.error}`);
          return { count: incoming.length, errors };
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Board sync failed";
          set({ syncing: false });
          return { count: 0, errors: [msg] };
        }
      },

      addManualJob: (job) => {
        const state = get();
        const catalog = state.getCatalog();
        const already = catalog.find(
          (j) => j.id === job.id || sameJobUrl(j.url, job.url),
        );
        if (already) return { job: already, already: true };
        set((s) => ({
          manualJobs: [job, ...s.manualJobs],
          activity: push(s.activity, {
            type: "application_created",
            title: `Added listing: ${job.title}`,
            detail: job.company,
          }),
        }));
        return { job, already: false };
      },

      removeManualJob: (jobId) => {
        set((s) => ({
          manualJobs: s.manualJobs.filter((j) => j.id !== jobId),
        }));
      },

      updateManualJob: (jobId, partial) => {
        set((s) => ({
          manualJobs: s.manualJobs.map((j) =>
            j.id === jobId ? { ...j, ...partial } : j,
          ),
        }));
      },

      patchCatalogJob: (jobId, partial) => {
        const state = get();
        if (state.manualJobs.some((j) => j.id === jobId)) {
          set((s) => ({
            manualJobs: s.manualJobs.map((j) =>
              j.id === jobId ? { ...j, ...partial } : j,
            ),
          }));
          return;
        }
        if (state.liveJobs.some((j) => j.id === jobId)) {
          set((s) => ({
            liveJobs: s.liveJobs.map((j) =>
              j.id === jobId ? { ...j, ...partial } : j,
            ),
          }));
        }
      },

      addAgent: (input) => {
        const id = uid("agent");
        const agent: SearchAgent = {
          ...input,
          id,
          createdAt: new Date().toISOString(),
          lastMatchCount: 0,
          totalMatches: 0,
        };
        set((s) => ({
          agents: [agent, ...s.agents],
          activity: push(s.activity, {
            type: "agent_created",
            title: `Agent “${agent.name}” created`,
            detail: agent.query,
          }),
        }));
        return id;
      },

      updateAgent: (id, partial) => {
        set((s) => ({
          agents: s.agents.map((a) => (a.id === id ? { ...a, ...partial } : a)),
        }));
      },

      deleteAgent: (id) => {
        set((s) => ({ agents: s.agents.filter((a) => a.id !== id) }));
      },

      runAgent: async (id) => {
        const state = get();
        const agent = state.agents.find((a) => a.id === id);
        if (!agent) return { newMatches: 0, autoSaved: 0 };
        set({ runningAgentId: id });

        // Refresh boards for this agent query when possible
        try {
          await get().syncBoards({ query: agent.query });
        } catch {
          /* offline / partial is fine */
        }

        const catalog = get().getCatalog();
        const existingJobIds = new Set(get().applications.map((a) => a.jobId));
        const result = matchAgentAgainstCatalog(
          agent,
          get().profile,
          catalog,
          existingJobIds,
        );

        set((s) => ({
          runningAgentId: null,
          agents: s.agents.map((a) =>
            a.id === id
              ? {
                  ...a,
                  lastRunAt: new Date().toISOString(),
                  lastMatchCount: result.newMatches,
                  totalMatches: a.totalMatches + result.newMatches,
                }
              : a,
          ),
          applications: [...result.newApps, ...s.applications],
          activity: [
            {
              id: uid("act"),
              type: "agent_run" as const,
              title: `Agent “${agent.name}” ran`,
              detail: `${result.newMatches} matches · ${result.autoSaved} auto-saved`,
              createdAt: new Date().toISOString(),
            },
            ...result.events,
            ...s.activity,
          ].slice(0, 80),
        }));

        return {
          newMatches: result.newMatches,
          autoSaved: result.autoSaved,
        };
      },

      runAllAgents: async () => {
        const enabled = get().agents.filter((a) => a.enabled);
        let newMatches = 0;
        for (const a of enabled) {
          const r = await get().runAgent(a.id);
          newMatches += r.newMatches;
        }
        return { agents: enabled.length, newMatches };
      },

      saveJob: (jobId, source = "manual", agentId) => {
        const state = get();
        if (state.applications.some((a) => a.jobId === jobId)) return;
        const job = state.getJobById(jobId);
        if (!job) return;
        const match = scoreJob(job, state.profile);
        const app: Application = {
          id: uid("app"),
          jobId,
          stage: "saved",
          matchScore: match.score,
          notes: "",
          updatedAt: new Date().toISOString(),
          source,
          agentId,
          coverLetter: generateCoverLetter(job, state.profile),
        };
        set((s) => ({
          applications: [app, ...s.applications],
          activity: push(s.activity, {
            type: "application_created",
            title: `Saved ${job.title} at ${job.company}`,
            detail: `${match.score}% match · ${job.source}`,
          }),
        }));
      },

      applyToJob: (jobId, coverLetter) => {
        const state = get();
        const existing = state.applications.find((a) => a.jobId === jobId);
        const job = state.getJobById(jobId);
        if (!job) return;
        const match = scoreJob(job, state.profile);
        const now = new Date().toISOString();

        if (existing) {
          set((s) => ({
            applications: s.applications.map((a) =>
              a.id === existing.id
                ? {
                    ...a,
                    stage: "applied" as const,
                    appliedAt: a.appliedAt ?? now,
                    updatedAt: now,
                    coverLetter: coverLetter ?? a.coverLetter,
                  }
                : a,
            ),
            activity: push(s.activity, {
              type: "stage_changed",
              title: `Applied to ${job.title} at ${job.company}`,
            }),
          }));
        } else {
          const app: Application = {
            id: uid("app"),
            jobId,
            stage: "applied",
            matchScore: match.score,
            notes: "",
            appliedAt: now,
            updatedAt: now,
            source: "manual",
            coverLetter:
              coverLetter ?? generateCoverLetter(job, state.profile),
          };
          set((s) => ({
            applications: [app, ...s.applications],
            activity: push(s.activity, {
              type: "application_created",
              title: `Applied to ${job.title} at ${job.company}`,
              detail: `${match.score}% match`,
            }),
          }));
        }
      },

      setStage: (applicationId, stage) => {
        const app = get().applications.find((a) => a.id === applicationId);
        if (!app) return;
        const job = get().getJobById(app.jobId);
        const now = new Date().toISOString();
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === applicationId
              ? {
                  ...a,
                  stage,
                  updatedAt: now,
                  appliedAt:
                    stage === "applied" || stage === "phone" || stage === "interview"
                      ? a.appliedAt ?? now
                      : a.appliedAt,
                }
              : a,
          ),
          activity: push(s.activity, {
            type: "stage_changed",
            title: job
              ? `Moved ${job.title} to ${stageLabel(stage)}`
              : `Stage → ${stageLabel(stage)}`,
          }),
        }));
      },

      updateApplication: (applicationId, partial) => {
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === applicationId
              ? { ...a, ...partial, updatedAt: new Date().toISOString() }
              : a,
          ),
        }));
      },

      removeApplication: (applicationId) => {
        set((s) => ({
          applications: s.applications.filter((a) => a.id !== applicationId),
        }));
      },

      getApplicationForJob: (jobId) =>
        get().applications.find((a) => a.jobId === jobId),

      pushActivity: (event) => {
        set((s) => ({ activity: push(s.activity, event) }));
      },

      resetDemo: () => {
        set({
          profile: defaultProfile,
          boardSettings: defaultBoardSettings,
          liveJobs: [],
          manualJobs: [],
          boardStatuses: [],
          lastSyncAt: undefined,
          syncing: false,
          agents: seedAgents(),
          applications: seedApplications(),
          activity: seedActivity(),
          runningAgentId: null,
        });
      },
    }),
    {
      name: "scout-job-automation-v13",
      partialize: (s) => ({
        profile: s.profile,
        boardSettings: s.boardSettings,
        liveJobs: s.liveJobs,
        manualJobs: s.manualJobs,
        boardStatuses: s.boardStatuses,
        lastSyncAt: s.lastSyncAt,
        agents: s.agents,
        applications: s.applications,
        activity: s.activity,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<JobStore>;
        return {
          ...current,
          ...p,
          boardSettings: mergeBoardSettings(p.boardSettings),
          liveJobs: Array.isArray(p.liveJobs) ? p.liveJobs : current.liveJobs,
          manualJobs: Array.isArray(p.manualJobs)
            ? p.manualJobs
            : current.manualJobs,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.boardSettings = mergeBoardSettings(state.boardSettings);
          if (!Array.isArray(state.manualJobs)) state.manualJobs = [];
          state.hydrated = true;
        }
      },
    },
  ),
);

export function stageLabel(stage: ApplicationStage): string {
  const map: Record<ApplicationStage, string> = {
    saved: "Saved",
    applied: "Applied",
    phone: "Phone screen",
    interview: "Interview",
    offer: "Offer",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
  };
  return map[stage];
}

export const PIPELINE_STAGES: ApplicationStage[] = [
  "saved",
  "applied",
  "phone",
  "interview",
  "offer",
  "rejected",
];

export const WORK_MODES: WorkMode[] = ["remote", "hybrid", "onsite"];
export const SENIORITIES: Seniority[] = [
  "intern",
  "junior",
  "mid",
  "senior",
  "staff",
  "lead",
  "director",
];

export { defaultProfile };

/** Stable catalog selector for React — never call getCatalog() inside useJobStore. */
export function useJobCatalog(): Job[] {
  const liveJobs = useJobStore((s) => s.liveJobs);
  const manualJobs = useJobStore((s) => s.manualJobs);
  const includeSeedJobs = useJobStore((s) => s.boardSettings.includeSeedJobs);
  return useMemo(
    () => mergeJobCatalog(SEED_JOBS, liveJobs, manualJobs, includeSeedJobs),
    [liveJobs, manualJobs, includeSeedJobs],
  );
}

