import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  MapPin,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  STATUS_LABEL,
  STATUS_VARIANT,
  useScoutStore,
} from "@/lib/store";
import type { JobStatus } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: BoardPage,
});

const FILTERS: Array<JobStatus | "all"> = [
  "all",
  "saved",
  "applied",
  "interview",
  "offer",
  "rejected",
];

function BoardPage() {
  const jobs = useScoutStore((s) => s.jobs);
  const addJob = useScoutStore((s) => s.addJob);
  const resetDemo = useScoutStore((s) => s.resetDemo);
  const [filter, setFilter] = useState<JobStatus | "all">("all");
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (filter !== "all" && j.status !== filter) return false;
      if (!q.trim()) return true;
      const hay = `${j.title} ${j.company} ${j.location}`.toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    });
  }, [jobs, filter, q]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: jobs.length };
    for (const j of jobs) c[j.status] = (c[j.status] ?? 0) + 1;
    return c;
  }, [jobs]);

  return (
    <AppShell
      title="Application board"
      subtitle="Track roles, open a job to tailor your resume against the description, then download a designed PDF."
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => { resetDemo(); toast.message("Demo data restored"); }}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset demo
          </Button>
          <Button size="sm" onClick={() => setShowAdd((v) => !v)}>
            <Plus className="h-3.5 w-3.5" />
            Add job
          </Button>
        </>
      }
    >
      {showAdd && (
        <AddJobForm
          onCancel={() => setShowAdd(false)}
          onSave={(data) => {
            const id = addJob(data);
            setShowAdd(false);
            toast.success("Job saved");
            // navigation via link is fine; user can click
            void id;
          }}
        />
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title or company"
            className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-card pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`h-9 rounded-full border px-3 text-xs font-medium transition-colors ${
                filter === f
                  ? "border-bg bg-bg text-fg-on-dark"
                  : "border-border bg-surface-card text-muted hover:text-fg"
              }`}
            >
              {f === "all" ? "All" : STATUS_LABEL[f]}{" "}
              <span className="opacity-70">{counts[f] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {filtered.map((job) => (
          <Link
            key={job.id}
            to="/jobs/$jobId"
            params={{ jobId: job.id }}
            className="group block"
          >
            <Card className="transition-shadow hover:shadow-[var(--shadow-elevated)]">
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                      {job.title}
                    </h2>
                    <Badge variant={STATUS_VARIANT[job.status]}>
                      {STATUS_LABEL[job.status]}
                    </Badge>
                    {job.matchScore != null && (
                      <Badge variant="secondary">{job.matchScore}% match</Badge>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {job.company}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </span>
                    {job.salary && <span>{job.salary}</span>}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary shrink-0">
                  Open
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-10 text-center text-muted text-sm">
              No jobs match this filter. Add a role or reset the demo data.
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

function AddJobForm({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (data: {
    title: string;
    company: string;
    location: string;
    description: string;
    salary?: string;
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");

  return (
    <Card className="mb-6">
      <CardContent className="p-5 space-y-3">
        <h3 className="font-semibold">New job</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title" value={title} onChange={setTitle} placeholder="Senior Engineer" />
          <Field label="Company" value={company} onChange={setCompany} placeholder="Acme" />
          <Field label="Location" value={location} onChange={setLocation} placeholder="Remote" />
          <Field label="Salary (optional)" value={salary} onChange={setSalary} placeholder="$150k" />
        </div>
        <label className="block text-xs font-medium text-muted">
          Job description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Paste the full job post for better ATS tailoring…"
            className="mt-1 w-full rounded-[var(--radius-md)] border border-border bg-surface-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            disabled={!title.trim() || !company.trim() || !description.trim()}
            onClick={() =>
              onSave({
                title: title.trim(),
                company: company.trim(),
                location: location.trim() || "Remote",
                salary: salary.trim() || undefined,
                description: description.trim(),
              })
            }
          >
            Save job
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-xs font-medium text-muted">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}
