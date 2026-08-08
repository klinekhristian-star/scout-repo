import { Building2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RelativeTime } from "@/components/relative-time";
import type { Job } from "@/data/types";
import { scoreJob } from "@/lib/matching";
import { useJobStore } from "@/lib/store";

export function JobCard({
  job,
  onOpen,
}: {
  job: Job;
  onOpen: (job: Job) => void;
}) {
  const profile = useJobStore((s) => s.profile);
  const app = useJobStore((s) =>
    s.applications.find((a) => a.jobId === job.id),
  );
  const match = scoreJob(job, profile);

  return (
    <button type="button" onClick={() => onOpen(job)} className="w-full min-w-0 text-left">
      <Card className="transition-shadow hover:shadow-[var(--shadow-elevated)] overflow-hidden">
        <CardContent className="p-4 sm:p-5 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-base sm:text-lg font-semibold tracking-tight break-words">
                {job.title}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {job.company}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </span>
                <RelativeTime date={job.postedAt} />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary">{match.score}% match</Badge>
              <Badge variant="outline">{job.source}</Badge>
              {app && <Badge variant="warning">{app.stage}</Badge>}
            </div>
          </div>
          {(job.salaryMin || job.salaryMax) && (
            <p className="text-sm text-muted">
              {job.salaryMin ? `$${Math.round(job.salaryMin / 1000)}k` : "?"}
              {" – "}
              {job.salaryMax ? `$${Math.round(job.salaryMax / 1000)}k` : "?"}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {job.skills.slice(0, 5).map((s) => (
              <Badge key={s} variant="outline">
                {s}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
