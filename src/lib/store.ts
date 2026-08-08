import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seedJobs, defaultResume } from "./seed-data";
import type { Job, JobStatus, MasterResume } from "./types";
import { uid } from "./utils";

interface ScoutState {
  resume: MasterResume;
  jobs: Job[];
  setResume: (resume: MasterResume) => void;
  updateResume: (patch: Partial<MasterResume>) => void;
  addJob: (job: Omit<Job, "id" | "postedAt" | "status"> & { status?: JobStatus }) => string;
  updateJob: (id: string, patch: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  resetDemo: () => void;
}

export const useScoutStore = create<ScoutState>()(
  persist(
    (set) => ({
      resume: defaultResume,
      jobs: seedJobs,
      setResume: (resume) => set({ resume }),
      updateResume: (patch) =>
        set((s) => ({ resume: { ...s.resume, ...patch } })),
      addJob: (job) => {
        const id = uid("job");
        set((s) => ({
          jobs: [
            {
              id,
              status: job.status ?? "saved",
              postedAt: new Date().toISOString().slice(0, 10),
              title: job.title,
              company: job.company,
              location: job.location,
              description: job.description,
              salary: job.salary,
              url: job.url,
              notes: job.notes,
            },
            ...s.jobs,
          ],
        }));
        return id;
      },
      updateJob: (id, patch) =>
        set((s) => ({
          jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
        })),
      deleteJob: (id) =>
        set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) })),
      resetDemo: () => set({ resume: defaultResume, jobs: seedJobs }),
    }),
    { name: "scout-app-v1" },
  ),
);

export const STATUS_LABEL: Record<JobStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

export const STATUS_VARIANT: Record<
  JobStatus,
  "outline" | "secondary" | "warning" | "success" | "accent"
> = {
  saved: "outline",
  applied: "secondary",
  interview: "warning",
  offer: "success",
  rejected: "accent",
};
