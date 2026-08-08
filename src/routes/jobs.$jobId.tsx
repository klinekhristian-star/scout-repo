import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  MapPin,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TailoredResumePanel } from "@/components/tailored-resume-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  STATUS_LABEL,
  STATUS_VARIANT,
  useScoutStore,
} from "@/lib/store";
import type { JobStatus } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/jobs/$jobId")({
  component: JobDetailPage,
});

const STATUSES: JobStatus[] = [
  "saved",
  "applied",
  "interview",
  "offer",
  "rejected",
];

function JobDetailPage() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const job = useScoutStore((s) => s.jobs.find((j) => j.id === jobId));
  const updateJob = useScoutStore((s) => s.updateJob);
  const deleteJob = useScoutStore((s) => s.deleteJob);

  if (!job) {
    return (
      <AppShell title="Job not found">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-muted text-sm">
              That role is not on your board (it may have been removed).
            </p>
            <Button asChild>
              <Link to="/">Back to board</Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={job.title}
      subtitle={`${job.company} · ${job.location}`}
      actions={
        <>
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-3.5 w-3.5" />
              Board
            </Link>
          </Button>
          {job.url && (
            <Button variant="outline" size="sm" asChild>
              <a href={job.url} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Posting
              </a>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-danger"
            onClick={() => {
              deleteJob(job.id);
              toast.message("Job removed");
              void navigate({ to: "/" });
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,1.05fr)] lg:items-start">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={STATUS_VARIANT[job.status]}>
                  {STATUS_LABEL[job.status]}
                </Badge>
                {job.salary && <Badge variant="outline">{job.salary}</Badge>}
                {job.matchScore != null && (
                  <Badge variant="secondary">{job.matchScore}% ATS match</Badge>
                )}
              </div>
              <CardTitle className="font-display text-xl pt-1">
                {job.company}
              </CardTitle>
              <div className="flex flex-wrap gap-3 text-sm text-muted">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {job.title}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block text-xs font-medium text-muted">
                Status
                <select
                  value={job.status}
                  onChange={(e) =>
                    updateJob(job.id, { status: e.target.value as JobStatus })
                  }
                  className="mt-1 h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
                  Job description
                </h3>
                <div className="rounded-[var(--radius-md)] border border-border bg-surface p-4 text-sm leading-relaxed whitespace-pre-wrap text-fg/90 max-h-[28rem] overflow-y-auto">
                  {job.description}
                </div>
              </div>

              <label className="block text-xs font-medium text-muted">
                Notes
                <textarea
                  value={job.notes ?? ""}
                  onChange={(e) => updateJob(job.id, { notes: e.target.value })}
                  rows={3}
                  placeholder="Interview notes, contacts, deadlines…"
                  className="mt-1 w-full rounded-[var(--radius-md)] border border-border bg-surface-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24">
          <TailoredResumePanel job={job} />
        </div>
      </div>
    </AppShell>
  );
}
