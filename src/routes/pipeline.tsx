import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/layout";
import { JobDetailSheet } from "@/components/job-detail-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ApplicationStage, Job } from "@/data/types";
import { useJobStore, PIPELINE_STAGES, stageLabel } from "@/lib/store";

export const Route = createFileRoute("/pipeline")({
  component: PipelinePage,
});

function PipelinePage() {
  const applications = useJobStore((s) => s.applications);
  const getJobById = useJobStore((s) => s.getJobById);
  const setStage = useJobStore((s) => s.setStage);
  const removeApplication = useJobStore((s) => s.removeApplication);
  const updateApplication = useJobStore((s) => s.updateApplication);
  const [selected, setSelected] = useState<Job | null>(null);
  const [view, setView] = useState<"board" | "list">("board");

  const byStage = useMemo(() => {
    const map: Record<string, typeof applications> = {};
    for (const s of PIPELINE_STAGES) map[s] = [];
    for (const a of applications) {
      (map[a.stage] ??= []).push(a);
    }
    return map;
  }, [applications]);

  return (
    <AppShell>
      <PageHeader
        title="Pipeline"
        subtitle="Move applications from saved through offer. Open a card for tailored resume + Generate PDF."
        actions={
          <div className="flex rounded-full border border-border p-1 bg-surface-card">
            {(["board", "list"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`h-8 px-3 rounded-full text-xs font-medium ${
                  view === v ? "bg-bg text-fg-on-dark" : "text-muted"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        }
      />

      {view === "board" ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => (
            <div
              key={stage}
              className="w-72 shrink-0 rounded-[var(--radius-lg)] border border-border bg-surface/60 p-3"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{stageLabel(stage)}</h3>
                <Badge variant="outline">{byStage[stage]?.length ?? 0}</Badge>
              </div>
              <div className="space-y-2">
                {(byStage[stage] ?? []).map((app) => {
                  const job = getJobById(app.jobId);
                  if (!job) return null;
                  return (
                    <Card key={app.id} className="cursor-pointer" onClick={() => setSelected(job)}>
                      <CardContent className="p-3 space-y-2">
                        <div className="font-medium text-sm leading-snug">{job.title}</div>
                        <div className="text-xs text-muted">{job.company}</div>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{app.matchScore}%</Badge>
                          <select
                            className="text-xs border border-border rounded px-1 py-0.5 bg-surface-card"
                            value={app.stage}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              setStage(app.id, e.target.value as ApplicationStage)
                            }
                          >
                            {PIPELINE_STAGES.map((s) => (
                              <option key={s} value={s}>
                                {stageLabel(s)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <textarea
                          className="w-full text-xs border border-border rounded p-1.5 bg-surface-card"
                          rows={2}
                          placeholder="Notes"
                          value={app.notes}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            updateApplication(app.id, { notes: e.target.value })
                          }
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {applications.map((app) => {
            const job = getJobById(app.jobId);
            if (!job) return null;
            return (
              <Card key={app.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <button type="button" className="text-left min-w-0" onClick={() => setSelected(job)}>
                    <div className="font-semibold">{job.title}</div>
                    <div className="text-sm text-muted">{job.company} · {app.matchScore}%</div>
                  </button>
                  <div className="flex flex-wrap gap-2 items-center">
                    <select
                      className="h-9 border border-border rounded-md px-2 text-sm"
                      value={app.stage}
                      onChange={(e) =>
                        setStage(app.id, e.target.value as ApplicationStage)
                      }
                    >
                      {PIPELINE_STAGES.map((s) => (
                        <option key={s} value={s}>{stageLabel(s)}</option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-danger"
                      onClick={() => removeApplication(app.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {applications.length === 0 && (
            <p className="text-sm text-muted p-8 text-center border border-border rounded-[var(--radius-lg)]">
              Pipeline is empty. Save roles from Discover or run agents with auto-save.
            </p>
          )}
        </div>
      )}

      <JobDetailSheet
        job={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </AppShell>
  );
}
