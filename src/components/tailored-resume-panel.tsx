import { useMemo, useState } from "react";
import {
  Download,
  FileDown,
  Loader2,
  Sparkles,
  Target,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { tailorResumeToJob } from "@/lib/ats-tailor";
import { buildResumePdf, downloadPdf, slugify } from "@/lib/pdf-resume";
import type { Job, TailoredResume } from "@/lib/types";
import { useScoutStore } from "@/lib/store";

export function TailoredResumePanel({ job }: { job: Job }) {
  const resume = useScoutStore((s) => s.resume);
  const updateJob = useScoutStore((s) => s.updateJob);
  const [tailored, setTailored] = useState<TailoredResume | null>(() =>
    job.matchScore != null ? tailorResumeToJob(resume, job) : null,
  );
  const [busy, setBusy] = useState<"tailor" | "pdf" | null>(null);

  const preview = useMemo(
    () => tailored ?? tailorResumeToJob(resume, job),
    [tailored, resume, job],
  );

  const runTailor = async () => {
    setBusy("tailor");
    try {
      await new Promise((r) => setTimeout(r, 350));
      const result = tailorResumeToJob(resume, job);
      setTailored(result);
      updateJob(job.id, {
        matchScore: result.matchScore,
        matchedKeywords: result.matchedKeywords,
        tailoredAt: new Date().toISOString(),
      });
      toast.success(`ATS tailor ready — ${result.matchScore}% keyword match`);
    } finally {
      setBusy(null);
    }
  };

  const generatePdf = async () => {
    setBusy("pdf");
    try {
      await new Promise((r) => setTimeout(r, 200));
      const result = tailored ?? tailorResumeToJob(resume, job);
      setTailored(result);
      updateJob(job.id, {
        matchScore: result.matchScore,
        matchedKeywords: result.matchedKeywords,
        tailoredAt: new Date().toISOString(),
      });
      const bytes = buildResumePdf(resume, result);
      const name = `${slugify(resume.fullName)}-${slugify(job.company)}-resume.pdf`;
      downloadPdf(bytes, name);
      toast.success("Designed PDF downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Could not generate PDF");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border bg-gradient-to-br from-primary-soft/40 to-surface-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Tailored resume
            </div>
            <CardTitle className="font-display text-xl">
              ATS-aligned for {job.company}
            </CardTitle>
            <CardDescription className="mt-1 max-w-xl">
              Job description → keyword match → reordered bullets & skills →
              designed PDF download. Uses your master resume; never invents
              experience.
            </CardDescription>
          </div>
          <div className="flex flex-col items-stretch sm:items-end gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-card px-3 py-1.5 text-sm">
              <Target className="h-3.5 w-3.5 text-primary" aria-hidden />
              <span className="text-muted">Match</span>
              <span className="font-semibold tabular-nums text-fg">
                {preview.matchScore}%
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={runTailor}
            disabled={busy !== null}
            variant="outline"
            className="sm:flex-1"
          >
            {busy === "tailor" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {tailored ? "Re-run ATS tailor" : "Run ATS tailor"}
          </Button>
          <Button
            onClick={generatePdf}
            disabled={busy !== null}
            className="sm:flex-1"
          >
            {busy === "pdf" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            Generate PDF
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <KeywordBlock
            title="Emphasized keywords"
            items={preview.matchedKeywords}
            empty="Run tailor to surface matches from the job description."
            tone="good"
          />
          <KeywordBlock
            title="Gaps vs. job post"
            items={preview.missingKeywords}
            empty="No major gaps detected against the posting."
            tone="warn"
          />
        </div>

        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h4 className="text-sm font-semibold text-fg">Preview</h4>
            <Badge variant="secondary">Live from master resume</Badge>
          </div>
          <p className="text-sm leading-relaxed text-fg/90">{preview.summary}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {preview.skills.slice(0, 12).map((s) => (
              <Badge key={s} variant="outline">
                {s}
              </Badge>
            ))}
          </div>
          <ul className="mt-4 space-y-3">
            {preview.experience.slice(0, 2).map((exp) => (
              <li key={exp.id}>
                <div className="text-sm font-semibold">
                  {exp.title}{" "}
                  <span className="font-normal text-muted">
                    · {exp.company}
                  </span>
                </div>
                <ul className="mt-1 space-y-1">
                  {exp.bullets.slice(0, 2).map((b) => (
                    <li
                      key={b}
                      className="text-xs text-muted leading-relaxed pl-3 relative before:content-['•'] before:absolute before:left-0"
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted flex items-start gap-1.5">
          <Download className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden />
          Generate PDF runs the full pipeline and downloads a designed,
          ATS-parseable PDF named for this company.
        </p>
      </CardContent>
    </Card>
  );
}

function KeywordBlock({
  title,
  items,
  empty,
  tone,
}: {
  title: string;
  items: string[];
  empty: string;
  tone: "good" | "warn";
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border p-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted mb-2">
        {tone === "warn" && (
          <AlertCircle className="h-3.5 w-3.5 text-warning" />
        )}
        {title}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((k) => (
            <Badge key={k} variant={tone === "good" ? "secondary" : "warning"}>
              {k}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
