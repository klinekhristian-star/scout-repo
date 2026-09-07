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
  OutreachEntry,
  Profile,
  SearchAgent,
  WorkMode,
  Seniority,
} from "@/data/types";
import { generateCoverLetter, jobMatchesAgent, scoreJob } from "@/lib/matching";
import { defaultSearchAgents } from "@/data/resume-tracks";
import {
  defaultBoardSettings,
  defaultProfile,
  emptyActivity,
  emptyAgents,
  emptyApplications,
  emptyStories,
  enabledBoards,
  mergeBoardSettings,
  sameJobUrl,
  uid,
} from "@/lib/store-helpers";
import { syncJobBoards } from "@/server/job-boards";

interface JobStore {
  profile: Profile;
  boardSettings: typeof defaultBoardSettings;
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
  stories: InterviewStory[];
  getCatalog: () => Job[];
  getJobById: (id: string) => Job | undefined;
  setProfile: (partial: Partial<Profile>) => void;
  setBoardSettings: (partial: Partial<typeof defaultBoardSettings>) => void;
  syncBoards: (opts?: { query?: string; location?: string }) => Promise<{ count: number; errors: string[] }>;
  addManualJob: (job: Job) => { job: Job; already: boolean };
  removeManualJob: (jobId: string) => void;
  updateManualJob: (jobId: string, partial: Partial<Job>) => void;
  patchCatalogJob: (jobId: string, partial: Partial<Job>) => void;
  addAgent: (input: Omit<SearchAgent, "id" | "createdAt" | "lastMatchCount" | "totalMatches">) => string;
  updateAgent: (id: string, partial: Partial<SearchAgent>) => void;
  deleteAgent: (id: string) => void;
  runAgent: (id: string) => Promise<{ newMatches: number; autoSaved: number }>;
  runAllAgents: () => Promise<{ agents: number; newMatches: number }>;
  saveJob: (jobId: string, source?: "manual" | "agent", agentId?: string) => void;
  applyToJob: (jobId: string, coverLetter?: string) => void;
  setStage: (applicationId: string, stage: ApplicationStage) => void;
  updateApplication: (applicationId: string, partial: Partial<Application>) => void;
  removeApplication: (applicationId: string) => void;
  getApplicationForJob: (jobId: string) => Application | undefined;
  pushActivity: (event: Omit<ActivityEvent, "id" | "createdAt">) => void;
  addStory: (input: Omit<InterviewStory, "id" | "createdAt" | "updatedAt">) => string;
  updateStory: (id: string, partial: Partial<InterviewStory>) => void;
  deleteStory: (id: string) => void;
  ensureApplication: (jobId: string) => Application | undefined;
  addOutreach: (jobId: string, entry: Omit<OutreachEntry, "id" | "createdAt" | "updatedAt">) => void;
  updateOutreach: (jobId: string, outreachId: string, partial: Partial<OutreachEntry>) => void;
  removeOutreach: (jobId: string, outreachId: string) => void;
  importBackup: (data: Record<string, unknown>) => void;
  resetDemo: () => void;
}

function push(list: ActivityEvent[], event: Omit<ActivityEvent, "id" | "createdAt">): ActivityEvent[] {
  return [{ ...event, id: uid("act"), createdAt: new Date().toISOString() }, ...list].slice(0, 80);
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
      applications: emptyApplications() as Application[],
      stories: emptyStories() as InterviewStory[],
      activity: emptyActivity() as ActivityEvent[],
      runningAgentId: null,
      hydrated: false,
      getCatalog: () => {
        const s = get();
        return mergeJobCatalog(SEED_JOBS, s.liveJobs, s.manualJobs, s.boardSettings.includeSeedJobs);
      },
      getJobById: (id) => get().getCatalog().find((j) => j.id === id),
      setProfile: (partial) =>
        set((s) => ({
          profile: { ...s.profile, ...partial },
          activity: push(s.activity, { type: "profile_updated", title: "Profile updated" }),
        })),
      setBoardSettings: (partial) =>
        set((s) => ({ boardSettings: mergeBoardSettings({ ...s.boardSettings, ...partial }) })),
      syncBoards: async (opts) => {
        const state = get();
        set({ syncing: true });
        try {
          const result = await syncJobBoards({
            data: {
              query: opts?.query || state.boardSettings.defaultQuery || "",
              location: opts?.location || "",
              limit: 40,
              adzunaAppId: state.boardSettings.adzunaAppId,
              adzunaAppKey: state.boardSettings.adzunaAppKey,
              adzunaCountry: state.boardSettings.adzunaCountry,
              atsEnabled: state.boardSettings.atsEnabled,
              atsTargets: state.boardSettings.atsTargets,
              boards: enabledBoards(state.boardSettings),
            },
          });
          const incoming: Job[] = [];
          for (const st of result.results ?? []) if (st.jobs) incoming.push(...st.jobs);
          const statuses: BoardSyncStatus[] = (result.results ?? []).map((st) => ({
            board: st.board,
            ok: !st.error,
            count: st.jobs?.length ?? 0,
            error: st.error,
            fetchedAt: st.fetchedAt,
            label: st.label,
          }));
          set((s) => {
            const byUrl = new Map(s.liveJobs.map((j) => [j.url, j]));
            for (const j of incoming) {
              const existing = [...byUrl.values()].find((x) => sameJobUrl(x.url, j.url));
              if (existing) byUrl.set(existing.url, { ...existing, ...j, id: existing.id });
              else byUrl.set(j.url, j);
            }
            return {
              liveJobs: Array.from(byUrl.values()).slice(0, 400),
              boardStatuses: statuses,
              lastSyncAt: new Date().toISOString(),
              syncing: false,
              activity: push(s.activity, {
                type: "boards_synced",
                title: `Synced ${incoming.length} roles from boards`,
              }),
            };
          });
          return { count: incoming.length, errors: statuses.filter((x) => x.error).map((x) => String(x.error)) };
        } catch (e) {
          set({ syncing: false });
          return { count: 0, errors: [e instanceof Error ? e.message : "sync failed"] };
        }
      },
      addManualJob: (job) => {
        const state = get();
        const already = state.manualJobs.some((j) => j.id === job.id || sameJobUrl(j.url, job.url));
        if (already) {
          return { job: state.manualJobs.find((j) => sameJobUrl(j.url, job.url)) ?? job, already: true };
        }
        set((s) => ({ manualJobs: [job, ...s.manualJobs] }));
        return { job, already: false };
      },
      removeManualJob: (jobId) => set((s) => ({ manualJobs: s.manualJobs.filter((j) => j.id !== jobId) })),
      updateManualJob: (jobId, partial) =>
        set((s) => ({ manualJobs: s.manualJobs.map((j) => (j.id === jobId ? { ...j, ...partial } : j)) })),
      patchCatalogJob: (jobId, partial) => {
        const s = get();
        if (s.manualJobs.some((j) => j.id === jobId))
          set({ manualJobs: s.manualJobs.map((j) => (j.id === jobId ? { ...j, ...partial } : j)) });
        else if (s.liveJobs.some((j) => j.id === jobId))
          set({ liveJobs: s.liveJobs.map((j) => (j.id === jobId ? { ...j, ...partial } : j)) });
      },
      addAgent: (input) => {
        const id = uid("agent");
        const agent: SearchAgent = { ...input, id, createdAt: new Date().toISOString(), lastMatchCount: 0, totalMatches: 0 };
        set((s) => ({ agents: [agent, ...s.agents], activity: push(s.activity, { type: "agent_created", title: `Agent “${agent.name}” created` }) }));
        return id;
      },
      updateAgent: (id, partial) => set((s) => ({ agents: s.agents.map((a) => (a.id === id ? { ...a, ...partial } : a)) })),
      deleteAgent: (id) => set((s) => ({ agents: s.agents.filter((a) => a.id !== id) })),
      runAgent: async (id) => {
        const state = get();
        const agent = state.agents.find((a) => a.id === id);
        if (!agent) return { newMatches: 0, autoSaved: 0 };
        set({ runningAgentId: id });
        const catalog = state.getCatalog();
        const existing = new Set(state.applications.map((a) => a.jobId));
        let newMatches = 0;
        let autoSaved = 0;
        const newApps: Application[] = [];
        for (const job of catalog) {
          if (!jobMatchesAgent(job, agent, state.profile)) continue;
          const match = scoreJob(job, state.profile);
          if (match.score < agent.minMatchScore || existing.has(job.id)) continue;
          newMatches++;
          if (agent.autoSave || match.score >= state.profile.autoSaveMatchesAbove) {
            autoSaved++;
            existing.add(job.id);
            newApps.push({
              id: uid("app"),
              jobId: job.id,
              stage: "saved",
              matchScore: match.score,
              notes: `Auto-saved by agent “${agent.name}”`,
              updatedAt: new Date().toISOString(),
              source: "agent",
              agentId: agent.id,
              coverLetter: generateCoverLetter(job, state.profile),
              outreach: [],
            });
          }
        }
        set((s) => ({
          applications: [...newApps, ...s.applications],
          agents: s.agents.map((a) =>
            a.id === id
              ? { ...a, lastRunAt: new Date().toISOString(), lastMatchCount: newMatches, totalMatches: a.totalMatches + newMatches }
              : a,
          ),
          runningAgentId: null,
        }));
        return { newMatches, autoSaved };
      },
      runAllAgents: async () => {
        const list = get().agents.filter((a) => a.enabled);
        let newMatches = 0;
        for (const a of list) newMatches += (await get().runAgent(a.id)).newMatches;
        return { agents: list.length, newMatches };
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
        set((s) => ({ applications: [app, ...s.applications] }));
      },
      applyToJob: (jobId, coverLetter) => {
        const state = get();
        const existing = state.applications.find((a) => a.jobId === jobId);
        const job = state.getJobById(jobId);
        const now = new Date().toISOString();
        if (existing) {
          set((s) => ({
            applications: s.applications.map((a) =>
              a.id === existing.id ? { ...a, stage: "applied", appliedAt: a.appliedAt ?? now, updatedAt: now, coverLetter: coverLetter ?? a.coverLetter } : a,
            ),
          }));
        } else if (job) {
          const match = scoreJob(job, state.profile);
          set((s) => ({
            applications: [
              {
                id: uid("app"),
                jobId,
                stage: "applied",
                matchScore: match.score,
                notes: "",
                appliedAt: now,
                updatedAt: now,
                source: "manual",
                coverLetter: coverLetter ?? generateCoverLetter(job, state.profile),
                outreach: [],
              },
              ...s.applications,
            ],
          }));
        }
      },
      setStage: (applicationId, stage) =>
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === applicationId
              ? { ...a, stage, updatedAt: new Date().toISOString(), appliedAt: stage === "applied" && !a.appliedAt ? new Date().toISOString() : a.appliedAt }
              : a,
          ),
        })),
      updateApplication: (applicationId, partial) =>
        set((s) => ({
          applications: s.applications.map((a) => (a.id === applicationId ? { ...a, ...partial, updatedAt: new Date().toISOString() } : a)),
        })),
      removeApplication: (applicationId) => set((s) => ({ applications: s.applications.filter((a) => a.id !== applicationId) })),
      getApplicationForJob: (jobId) => get().applications.find((a) => a.jobId === jobId),
      pushActivity: (event) => set((s) => ({ activity: push(s.activity, event) })),
      addStory: (input) => {
        const id = uid("story");
        const now = new Date().toISOString();
        const story: InterviewStory = { ...input, id, createdAt: now, updatedAt: now };
        set((s) => ({ stories: [story, ...s.stories] }));
        return id;
      },
      updateStory: (id, partial) =>
        set((s) => ({ stories: s.stories.map((st) => (st.id === id ? { ...st, ...partial, updatedAt: new Date().toISOString() } : st)) })),
      deleteStory: (id) => set((s) => ({ stories: s.stories.filter((st) => st.id !== id) })),
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
        const row: OutreachEntry = { ...entry, id: uid("out"), createdAt: now, updatedAt: now };
        set((s) => ({
          applications: s.applications.map((a) => (a.id === app.id ? { ...a, outreach: [row, ...(a.outreach ?? [])], updatedAt: now } : a)),
        }));
      },
      updateOutreach: (jobId, outreachId, partial) => {
        const app = get().getApplicationForJob(jobId);
        if (!app) return;
        const now = new Date().toISOString();
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === app.id
              ? { ...a, outreach: (a.outreach ?? []).map((o) => (o.id === outreachId ? { ...o, ...partial, updatedAt: now } : o)), updatedAt: now }
              : a,
          ),
        }));
      },
      removeOutreach: (jobId, outreachId) => {
        const app = get().getApplicationForJob(jobId);
        if (!app) return;
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === app.id ? { ...a, outreach: (a.outreach ?? []).filter((o) => o.id !== outreachId) } : a,
          ),
        }));
      },
      importBackup: (data) => {
        const d = data as {
          profile?: Profile;
          boardSettings?: typeof defaultBoardSettings;
          agents?: SearchAgent[];
          applications?: Application[];
          stories?: InterviewStory[];
          activity?: ActivityEvent[];
          liveJobs?: Job[];
          manualJobs?: Job[];
          lastSyncAt?: string;
        };
        set((s) => ({
          profile: d.profile ?? s.profile,
          boardSettings: d.boardSettings ? mergeBoardSettings(d.boardSettings) : s.boardSettings,
          agents: Array.isArray(d.agents) ? d.agents : s.agents,
          applications: Array.isArray(d.applications) ? d.applications : s.applications,
          stories: Array.isArray(d.stories) ? d.stories : s.stories,
          liveJobs: Array.isArray(d.liveJobs) ? d.liveJobs : s.liveJobs,
          manualJobs: Array.isArray(d.manualJobs) ? d.manualJobs : s.manualJobs,
          lastSyncAt: d.lastSyncAt ?? s.lastSyncAt,
        }));
      },
      resetDemo: () =>
        set({
          profile: defaultProfile,
          boardSettings: defaultBoardSettings,
          liveJobs: [],
          manualJobs: [],
          boardStatuses: [],
          lastSyncAt: undefined,
          syncing: false,
          agents: emptyAgents(),
          applications: [],
          stories: [],
          activity: [],
          runningAgentId: null,
        }),
    }),
    {
      name: "scout-job-automation-v16-agents",
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
          agents: Array.isArray(p.agents) && p.agents.length > 0 ? p.agents : defaultSearchAgents(),
          liveJobs: Array.isArray(p.liveJobs) ? p.liveJobs : current.liveJobs,
          manualJobs: Array.isArray(p.manualJobs) ? p.manualJobs : current.manualJobs,
          stories: Array.isArray(p.stories) ? p.stories : current.stories,
          applications: Array.isArray(p.applications) ? p.applications : current.applications,
          activity: Array.isArray(p.activity) ? p.activity : current.activity,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.boardSettings = mergeBoardSettings(state.boardSettings);
        if (!Array.isArray(state.agents) || state.agents.length === 0) state.agents = defaultSearchAgents();
        if (!Array.isArray(state.manualJobs)) state.manualJobs = [];
        if (!Array.isArray(state.stories)) state.stories = [];
        if (!Array.isArray(state.applications)) state.applications = [];
        state.hydrated = true;
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

export const PIPELINE_STAGES: ApplicationStage[] = ["saved", "applied", "phone", "interview", "offer", "rejected"];
export const WORK_MODES: WorkMode[] = ["remote", "hybrid", "onsite"];
export const SENIORITIES: Seniority[] = ["intern", "junior", "mid", "senior", "staff", "lead", "director"];
export { defaultProfile };

export function useJobCatalog(): Job[] {
  const liveJobs = useJobStore((s) => s.liveJobs);
  const manualJobs = useJobStore((s) => s.manualJobs);
  const includeSeedJobs = useJobStore((s) => s.boardSettings.includeSeedJobs);
  return useMemo(
    () => mergeJobCatalog(SEED_JOBS, liveJobs, manualJobs, includeSeedJobs),
    [liveJobs, manualJobs, includeSeedJobs],
  );
}
