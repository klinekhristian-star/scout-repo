import {
  Banknote,
  Bookmark,
  BookmarkCheck,
  Copy,
  ExternalLink,
  FileDown,
  FileText,
  Loader2,
  MapPin,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Job, TailoredResumeSnapshot } from "@/data/types";
import { type ResumeVariantId } from "@/data/resume-library";
import { listResumeVariants } from "@/lib/tailor-resume";
import { generateCoverLetter, scoreJob } from "@/lib/matching";
import { buildResumePdf, downloadPdf, slugify } from "@/lib/pdf-resume";
import { useJobStore } from "@/lib/store";
import { tailorResumeForJob } from "@/lib/tailor-resume";

export function JobDetailSheet({
  job,
  open,
  onOpenChange,
}: {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const profile = useJobStore((s) => s.profile);
  const saveJob = useJobStore((s) => s.saveJob);
  const applyToJob = useJobStore((s) => s.applyToJob);
  const updateApplication = useJobStore((s) => s.updateApplication);
  const getApplicationForJob = useJobStore((s) => s.getApplicationForJob);
  const pushActivity = useJobStore((s) => s.pushActivity);

  const [variantId, setVariantId] = useState<ResumeVariantId>("impact");
  const [tailored, setTailored] = useState<TailoredResumeSnapshot | null>(null);
  const [cover, setCover] = useState<string | null>(null);
  const [busy, setBusy] = useState<"tailor" | "pdf" | null>(null);

  const match = useMemo(
    () => (job ? scoreJob(job, profile) : null),
    [job, profile],
  );
  const app = job ? getApplicationForJob(job.id) : undefined;

  if (!open || !job || !match) return null;

  const runTailor = async () => {
    setBusy("tailor");
    try {
      await new Promise((r) => setTimeout(r, 250));
      const result = tailorResumeForJob(job, profile, variantId);
      setTailored(result);
      if (app) {
        updateApplication(app.id, { tailoredResume: result });
      } else {
        saveJob(job.id, "manual");
        const created = useJobStore.getState().getApplicationForJob(job.id);
        if (created) updateApplication(created.id, { tailoredResume: result });
      }
      pushActivity({
        type: "resume_tailored",
        title: `Tailored resume for ${job.title}`,
        detail: job.company,
      });
      toast.success(`ATS tailor ready — ${result.atsScore}% alignment`);
    } finally {
      setBusy(null);
    }
  };

  const runPdf = async () => {
    setBusy("pdf");
    try {
      const result = tailored ?? tailorResumeForJob(job, profile, variantId);
      setTailored(result);
      const bytes = buildResumePdf(
        {
          fullName: profile.name,
          headline: result.tailoredHeadline,
          email: profile.email,
          phone: "",
          location: profile.location,
          links: [],
        },
        {
          summary: result.tailoredSummary,
          skills: result.prioritizedSkills ?? profile.skills,
          experience: (result.experienceBlocks ?? []).map((b, i) => ({
            id: `x${i}`,
            company: job.company,
            title: i === 0 ? "Selected outcomes" : "Experience",
            location: profile.location,
            start: "",
            end: "",
            bullets: [b],
          })),
          education: [],
          matchedKeywords: result.matchedKeywords,
          missingKeywords: result.missingKeywords,
          matchScore: result.atsScore,
          targetRole: job.title,
          targetCompany: job.company,
        },
      );
      downloadPdf(
        bytes,
        `${slugify(profile.name)}-${slugify(job.company)}-${slugify(job.title)}-tailored.pdf`,
      );
      toast.success("Designed PDF downloaded");
    } catch (e) {
      console.error(e);
      toast.error("PDF generation failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-bg/50 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-border bg-surface-card shadow-[var(--shadow-elevated)] overflow-hidden">
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-2">
              <Badge variant="secondary">{match.score}% match</Badge>
              <Badge variant="outline">{job.source}</Badge>
              <Badge variant="outline">{job.workMode}</Badge>
              {app && <Badge variant="warning">{app.stage}</Badge>}
            </div>
            <h2 className="font-display text-xl font-semibold leading-tight">
              {job.title}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {job.company} · {job.location}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (!job.url) return;
                window.open(job.url, "_blank", "noopener,noreferrer");
              }}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open listing
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                saveJob(job.id, "manual");
                toast.success("Saved to pipeline");
              }}
            >
              {app ? (
                <BookmarkCheck className="h-3.5 w-3.5" />
              ) : (
                <Bookmark className="h-3.5 w-3.5" />
              )}
              {app ? "In pipeline" : "Save"}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const letter = cover ?? generateCoverLetter(job, profile);
                setCover(letter);
                applyToJob(job.id, letter);
                toast.success("Marked applied");
              }}
            >
              <Send className="h-3.5 w-3.5" />
              Mark applied
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              ["Title", match.title],
              ["Skills", match.skills],
              ["Location", match.location],
            ].map(([label, val]) => (
              <div
                key={label as string}
                className="rounded-[var(--radius-md)] border border-border p-2"
              >
                <div className="text-lg font-semibold tabular-nums">{val}</div>
                <div className="text-[11px] uppercase tracking-wide text-muted">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {(job.salaryMin || job.salaryMax) && (
            <p className="text-sm text-muted inline-flex items-center gap-1.5">
              <Banknote className="h-4 w-4" />
              {job.salaryMin ? `$${job.salaryMin.toLocaleString()}` : "?"} –{" "}
              {job.salaryMax ? `$${job.salaryMax.toLocaleString()}` : "?"}
            </p>
          )}

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
              Description
            </h3>
            <div className="max-h-48 overflow-y-auto rounded-[var(--radius-md)] border border-border bg-surface p-3 text-sm leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>
          </section>

          <section className="rounded-[var(--radius-lg)] border border-border overflow-hidden">
            <div className="border-b border-border bg-primary-soft/40 px-4 py-3">
              <div className="inline-flex items-center gap-1.5 text-primary text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                Tailored resume
              </div>
              <p className="text-sm text-muted mt-1">
                Job description → ATS tailor from your resume library → designed
                PDF download.
              </p>
            </div>
            <div className="p-4 space-y-3">
              <label className="block text-xs font-medium text-muted">
                Base resume
                <select
                  value={variantId}
                  onChange={(e) =>
                    setVariantId(e.target.value as ResumeVariantId)
                  }
                  className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface-card px-3 text-sm"
                >
                  {listResumeVariants().map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  className="sm:flex-1"
                  variant="outline"
                  disabled={busy !== null}
                  onClick={() => void runTailor()}
                >
                  {busy === "tailor" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  Suggest tailored resume
                </Button>
                <Button
                  className="sm:flex-1"
                  disabled={busy !== null}
                  onClick={() => void runPdf()}
                >
                  {busy === "pdf" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4" />
                  )}
                  Generate PDF
                </Button>
              </div>

              {tailored && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary">
                      ATS {tailored.atsScore}%
                    </Badge>
                    <Badge variant="outline">{tailored.baseVariantName}</Badge>
                  </div>
                  <p className="text-sm font-medium">{tailored.tailoredHeadline}</p>
                  <p className="text-sm text-muted leading-relaxed">
                    {tailored.tailoredSummary}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {tailored.matchedKeywords.map((k) => (
                      <Badge key={k} variant="secondary">
                        {k}
                      </Badge>
                    ))}
                  </div>
                  <Textarea
                    value={tailored.plainText}
                    readOnly
                    rows={8}
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await navigator.clipboard.writeText(tailored.plainText);
                      toast.success("Copied tailored text");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy text
                  </Button>
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Cover letter draft
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCover(generateCoverLetter(job, profile))}
              >
                Generate
              </Button>
            </div>
            {cover && (
              <Textarea value={cover} onChange={(e) => setCover(e.target.value)} rows={8} />
            )}
          </section>

          <p className="text-xs text-muted inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Matched skills: {match.matchedSkills.slice(0, 6).join(", ") || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
