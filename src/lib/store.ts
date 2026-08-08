import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEED_JOBS, mergeJobCatalog } from "@/data/jobs";
import type {
  ActivityEvent,
  Application,
  ApplicationStage,
  BoardSyncStatus,
  InterviewStory,
  Job,
  JobBoardSettings,
  OutreachEntry,
  Profile,
  SearchAgent,
  WorkMode,
  Seniority,
} from "@/data/types";
import { defaultAtsTargets } from "@/lib/job-boards/ats";
import { TOGGLE_BOARD_IDS, type ToggleBoardId } from "@/lib/job-boards/meta";
import { generateCoverLetter, jobMatchesAgent, scoreJob } from "@/lib/matching";
import { syncJobBoards } from "@/server/job-boards";

/** Profile — real user defaults, not demo content. */
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
  includeSeedJobs: false,
  defaultQuery: "go-to-market customer engagement marketing technology",
  atsEnabled: false,
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
        : false;
  base.includeSeedJobs = false;
  return base;
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

function emptyAgents(): SearchAgent[] {
  return [];
}

function emptyApplications(): Application[] {
  return [];
}

function emptyActivity(): ActivityEvent[] {
  return [];
}

function emptyStories(): InterviewStory[] {
  return [];
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

  stories: InterviewStory[];
  addStory: (
    input: Omit<InterviewStory, "id" | "createdAt" | "updatedAt">,
  ) => string;
  updateStory: (id: string, partial: Partial<InterviewStory>) => void;
  deleteStory: (id: string) => void;

  ensureApplication: (jobId: string) => Application | undefined;
  addOutreach: (
    jobId: string,
    entry: Omit<OutreachEntry, "id" | "createdAt" | "updatedAt">,
  ) => void;
  updateOutreach: (
    jobId: string,
    outreachId: string,
    partial: Partial<OutreachEntry>,
  ) => void;
  removeOutreach: (jobId: string, outreachId: string) => void;

  importBackup: (data: {
    profile: Profile;
    boardSettings?: JobBoardSettings;
    agents?: SearchAgent[];
    applications?: Application[];
    stories?: InterviewStory[];
    activity?: ActivityEvent[];
    liveJobs?: Job[];
    manualJobs?: Job[];
    lastSyncAt?: string;
  }) => void;

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
        outreach: [],
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
      agents: emptyAgents(),
      applications: emptyApplications(),
      stories: emptyStories(),
      activity: emptyActivity(),
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
            title: "Profile updated",
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
        set({ syncing: true });
        try {
          const boards = enabledBoards(state.boardSettings);
          const result = await syncJobBoards({
            data: {
              query:
                opts?.query ||
                state.boardSettings.defaultQuery ||
                state.profile.targetTitles[0] ||
                "",
              location: opts?.location || "",
              limit: 40,
              adzunaAppId: state.boardSettings.adzunaAppId,
              adzunaAppKey: state.boardSettings.adzunaAppKey,
              adzunaCountry: state.boardSettings.adzunaCountry,
              atsEnabled: state.boardSettings.atsEnabled,
              atsTargets: state.boardSettings.atsTargets,
              boards,
            },
          });

          const incoming: Job[] = [];
          for (const st of result.results ?? []) {
            if (st.jobs) incoming.push(...st.jobs);
          }

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
        const already = state.manualJobs.some(
          (j) => j.id === job.id || sameJobUrl(j.url, job.url),
        );
        if (already) {
          return {
            job:
              state.manualJobs.find(
                (j) => j.id === job.id || sameJobUrl(j.url, job.url),
              ) ?? job,
            already: true,
          };
        }
        set((s) => ({ manualJobs: [job, ...s.manualJobs] }));
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
        try {
          const catalog = state.getCatalog();
          const existingJobIds = new Set(state.applications.map((a) => a.jobId));
          const result = matchAgentAgainstCatalog(
            agent,
            state.profile,
            catalog,
            existingJobIds,
          );
          set((s) => ({
            applications: [...result.newApps, ...s.applications],
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
            activity: [
              {
                id: uid("act"),
                type: "agent_run" as const,
                title: `Agent “${agent.name}” ran`,
                detail: `${result.newMatches} new · ${result.autoSaved} auto-saved`,
                createdAt: new Date().toISOString(),
              },
              ...result.events,
              ...s.activity,
            ].slice(0, 80),
            runningAgentId: null,
          }));
          return {
            newMatches: result.newMatches,
            autoSaved: result.autoSaved,
          };
        } finally {
          set({ runningAgentId: null });
        }
      },

      runAllAgents: async () => {
        const agents = get().agents.filter((a) => a.enabled);
        let newMatches = 0;
        for (const a of agents) {
          const r = await get().runAgent(a.id);
          newMatches += r.newMatches;
        }
        return { agents: agents.length, newMatches };
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
          outreach: [],
        };
        set((s) => ({
          applications: [app, ...s.applications],
          activity: push(s.activity, {
            type: "application_created",
            title: `Saved ${job.title}`,
            detail: job.company,
          }),
        }));
      },

      applyToJob: (jobId, coverLetter) => {
        const state = get();
        const existing = state.applications.find((a) => a.jobId === jobId);
        const job = state.getJobById(jobId);
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
              title: `Applied: ${job?.title ?? "role"}`,
              detail: job?.company,
            }),
          }));
        } else if (job) {
          const match = scoreJob(job, state.profile);
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
            outreach: [],
          };
          set((s) => ({
            applications: [app, ...s.applications],
            activity: push(s.activity, {
              type: "application_created",
              title: `Applied: ${job.title}`,
              detail: job.company,
            }),
          }));
        }
      },

      setStage: (applicationId, stage) => {
        const app = get().applications.find((a) => a.id === applicationId);
        const job = app ? get().getJobById(app.jobId) : undefined;
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === applicationId
              ? {
                  ...a,
                  stage,
                  updatedAt: new Date().toISOString(),
                  appliedAt:
                    stage === "applied" && !a.appliedAt
                      ? new Date().toISOString()
                      : a.appliedAt,
                }
              : a,
          ),
          activity: push(s.activity, {
            type: "stage_changed",
            title: `Stage → ${stage}`,
            detail: job ? `${job.title} · ${job.company}` : undefined,
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

      addStory: (input) => {
        const id = uid("story");
        const now = new Date().toISOString();
        const story: InterviewStory = {
          ...input,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({
          stories: [story, ...s.stories],
          activity: push(s.activity, {
            type: "story_updated",
            title: `Story added: ${story.title}`,
          }),
        }));
        return id;
      },

      updateStory: (id, partial) => {
        set((s) => ({
          stories: s.stories.map((st) =>
            st.id === id
              ? { ...st, ...partial, updatedAt: new Date().toISOString() }
              : st,
          ),
        }));
      },

      deleteStory: (id) => {
        set((s) => ({
          stories: s.stories.filter((st) => st.id !== id),
          activity: push(s.activity, {
            type: "story_updated",
            title: "Story removed from bank",
          }),
        }));
      },

      ensureApplication: (jobId) => {
        const existing = get().getApplicationForJob(jobId);
        if (existing) return existing;
        get().saveJob(jobId, "manual");
        return get().getApplicationForJob(jobId);
      },

      addOutreach: (jobId, entry) => {
        const app = get().ensureApplication(jobId);
        if (!app) return;
        const now = new Date().toISOString();
        const row: OutreachEntry = {
          ...entry,
          id: uid("out"),
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === app.id
              ? {
                  ...a,
                  outreach: [row, ...(a.outreach ?? [])],
                  updatedAt: now,
                }
              : a,
          ),
          activity: push(s.activity, {
            type: "outreach_logged",
            title: `Outreach: ${entry.contactName}`,
            detail: `${entry.channel} · ${entry.status}`,
          }),
        }));
      },

      updateOutreach: (jobId, outreachId, partial) => {
        const app = get().getApplicationForJob(jobId);
        if (!app) return;
        const now = new Date().toISOString();
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === app.id
              ? {
                  ...a,
                  outreach: (a.outreach ?? []).map((o) =>
                    o.id === outreachId
                      ? { ...o, ...partial, updatedAt: now }
                      : o,
                  ),
                  updatedAt: now,
                }
              : a,
          ),
        }));
      },

      removeOutreach: (jobId, outreachId) => {
        const app = get().getApplicationForJob(jobId);
        if (!app) return;
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === app.id
              ? {
                  ...a,
                  outreach: (a.outreach ?? []).filter(
                    (o) => o.id !== outreachId,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : a,
          ),
        }));
      },

      importBackup: (data) => {
        set((s) => {
          const baseActivity = Array.isArray(data.activity)
            ? data.activity
            : s.activity;
          return {
            profile: data.profile ?? s.profile,
            boardSettings: data.boardSettings
              ? mergeBoardSettings(data.boardSettings)
              : s.boardSettings,
            agents: Array.isArray(data.agents) ? data.agents : s.agents,
            applications: Array.isArray(data.applications)
              ? data.applications.map((a) => ({
                  ...a,
                  outreach: Array.isArray(a.outreach) ? a.outreach : [],
                }))
              : s.applications,
            stories: Array.isArray(data.stories) ? data.stories : s.stories,
            liveJobs: Array.isArray(data.liveJobs) ? data.liveJobs : s.liveJobs,
            manualJobs: Array.isArray(data.manualJobs)
              ? data.manualJobs
              : s.manualJobs,
            lastSyncAt: data.lastSyncAt ?? s.lastSyncAt,
            activity: [
              {
                id: uid("act"),
                type: "profile_updated" as const,
                title: "Backup restored",
                detail: new Date().toLocaleString(),
                createdAt: new Date().toISOString(),
              },
              ...baseActivity,
            ].slice(0, 80),
          };
        });
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
          agents: emptyAgents(),
          applications: emptyApplications(),
          stories: emptyStories(),
          activity: emptyActivity(),
          runningAgentId: null,
        });
      },
    }),
    {
      name: "scout-job-automation-v14-clean",
      partialize: (s) => ({
        profile: s.profile,
        boardSettings: s.boardSettings,
        liveJobs: s.liveJobs,
        manualJobs: s.manualJobs,
        boardStatuses: s.boardStatuses,
        lastSyncAt: s.lastSyncAt,
        agents: s.agents,
        applications: s.applications,
        stories: s.stories,
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
          stories: Array.isArray(p.stories) ? p.stories : current.stories,
          applications: Array.isArray(p.applications)
            ? p.applications.map((a: Application) => ({
                ...a,
                outreach: Array.isArray(a.outreach) ? a.outreach : [],
              }))
            : current.applications,
          agents: Array.isArray(p.agents) ? p.agents : current.agents,
          activity: Array.isArray(p.activity) ? p.activity : current.activity,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.boardSettings = mergeBoardSettings(state.boardSettings);
          if (!Array.isArray(state.manualJobs)) state.manualJobs = [];
          if (!Array.isArray(state.stories)) state.stories = [];
          if (!Array.isArray(state.agents)) state.agents = [];
          if (!Array.isArray(state.applications)) state.applications = [];
          if (Array.isArray(state.applications)) {
            state.applications = state.applications.map((a) => ({
              ...a,
              outreach: Array.isArray(a.outreach) ? a.outreach : [],
            }));
          }
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
