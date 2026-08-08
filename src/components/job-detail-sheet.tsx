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
  MessageSquare,
  Network,
  Package,
  Plus,
  Send,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  Job,
  OutreachChannel,
  OutreachStatus,
  TailoredResumeSnapshot,
} from "@/data/types";
import { type ResumeVariantId } from "@/data/resume-library";
import {
  buildApplicationPacket,
  buildLinkedInNote,
  downloadTextFile,
} from "@/lib/application-packet";
import { buildInterviewKit, storyPlainText } from "@/lib/interview-kit";
import { generateCoverLetter, scoreJob } from "@/lib/matching";
import { buildResumePdf, downloadPdf, slugify } from "@/lib/pdf-resume";
import { useJobStore } from "@/lib/store";
import { listResumeVariants, tailorResumeForJob } from "@/lib/tailor-resume";
import type { Experience } from "@/lib/types";

function snapshotToPdfExperience(
  result: TailoredResumeSnapshot,
  job: Job,
  profileLocation: string,
): Experience[] {
  const metrics = result.metrics ?? [];
  const blocks = result.experienceBlocks ?? [];

  const selected: Experience = {
    id: "selected",
    company: job.company,
    title: "Selected outcomes (role-aligned)",
    location: profileLocation,
    start: "",
    end: "Present",
    bullets: [
      ...metrics.slice(0, 4).map((m) => `${m.metric} — ${m.label}: ${m.detail}`),
      ...blocks.slice(0, 4),
    ].filter(Boolean),
  };

  const rest = blocks.slice(4);
  if (rest.length === 0) return [selected];

  return [
    selected,
    {
      id: "career",
      company: "Career highlights",
      title: result.tailoredHeadline,
      location: profileLocation,
      start: "",
      end: "",
      bullets: rest,
    },
  ];
}

const CHANNELS: OutreachChannel[] = [
  "linkedin",
  "email",
  "referral",
  "call",
  "event",
  "other",
];
const STATUSES: OutreachStatus[] = [
  "planned",
  "sent",
  "replied",
  "meeting",
  "closed",
];

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
  const stories = useJobStore((s) => s.stories);
  const saveJob = useJobStore((s) => s.saveJob);
  const applyToJob = useJobStore((s) => s.applyToJob);
  const updateApplication = useJobStore((s) => s.updateApplication);
  const getApplicationForJob = useJobStore((s) => s.getApplicationForJob);
  const pushActivity = useJobStore((s) => s.pushActivity);
  const addOutreach = useJobStore((s) => s.addOutreach);
  const updateOutreach = useJobStore((s) => s.updateOutreach);
  const removeOutreach = useJobStore((s) => s.removeOutreach);
  const ensureApplication = useJobStore((s) => s.ensureApplication);

  const [variantId, setVariantId] = useState<ResumeVariantId>("impact");
  const [tailored, setTailored] = useState<TailoredResumeSnapshot | null>(null);
  const [cover, setCover] = useState<string | null>(null);
  const [linkedIn, setLinkedIn] = useState<string | null>(null);
  const [referralPath, setReferralPath] = useState("");
  const [busy, setBusy] = useState<"tailor" | "pdf" | "packet" | null>(null);
  const [outForm, setOutForm] = useState({
    contactName: "",
    contactRole: "",
    channel: "linkedin" as OutreachChannel,
    status: "planned" as OutreachStatus,
    note: "",
    nextFollowUp: "",
  });

  const match = useMemo(
    () => (job ? scoreJob(job, profile) : null),
    [job, profile],
  );
  const app = job ? getApplicationForJob(job.id) : undefined;

  const kit = useMemo(
    () => (job ? buildInterviewKit(job, profile, stories) : null),
    [job, profile, stories],
  );

  useEffect(() => {
    if (!job) {
      setTailored(null);
      setCover(null);
      setLinkedIn(null);
      setReferralPath("");
      return;
    }
    const existing = useJobStore.getState().getApplicationForJob(job.id);
    setTailored(existing?.tailoredResume ?? null);
    setCover(existing?.coverLetter ?? null);
    setLinkedIn(existing?.linkedInNote ?? null);
    setReferralPath(existing?.referralPath ?? "");
    setVariantId(
      (existing?.tailoredResume?.baseVariantId as ResumeVariantId) || "impact",
    );
  }, [job?.id]);

  if (!open || !job || !match || !kit) return null;

  const persistTailor = (result: TailoredResumeSnapshot) => {
    const a = ensureApplication(job.id);
    if (a) updateApplication(a.id, { tailoredResume: result });
  };

  const runTailor = async () => {
    setBusy("tailor");
    try {
      await new Promise((r) => setTimeout(r, 250));
      const result = tailorResumeForJob(job, profile, variantId);
      setTailored(result);
      persistTailor(result);
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

  const buildPdfBytes = (result: TailoredResumeSnapshot) =>
    buildResumePdf(
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
        experience: snapshotToPdfExperience(result, job, profile.location),
        education: [
          {
            id: "edu-1",
            school: "Executive career · GTM Insights Group · ON24",
            degree: "Enterprise GTM · Digital engagement · MarTech",
            year: "25+ years",
          },
        ],
        matchedKeywords: result.matchedKeywords,
        missingKeywords: result.missingKeywords,
        matchScore: result.atsScore,
        targetRole: job.title,
        targetCompany: job.company,
      },
    );

  const runPdf = async () => {
    setBusy("pdf");
    try {
      const result = tailored ?? tailorResumeForJob(job, profile, variantId);
      setTailored(result);
      if (!tailored) persistTailor(result);
      const bytes = buildPdfBytes(result);
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

  const runPacket = async () => {
    setBusy("packet");
    try {
      const a = ensureApplication(job.id);
      const packet = buildApplicationPacket({
        job,
        profile,
        application: a
          ? { ...a, referralPath: referralPath || a.referralPath }
          : undefined,
        stories: kit.mappedStories
          .map((m) => stories.find((s) => s.id === m.storyId)!)
          .filter(Boolean),
        variantId,
        existingTailored: tailored,
        existingCover: cover,
        existingLinkedIn: linkedIn,
      });
      setTailored(packet.tailored);
      setCover(packet.coverLetter);
      setLinkedIn(packet.linkedInNote);
      if (a) {
        updateApplication(a.id, {
          tailoredResume: packet.tailored,
          coverLetter: packet.coverLetter,
          linkedInNote: packet.linkedInNote,
          referralPath: referralPath || a.referralPath,
        });
      }
      const bytes = buildPdfBytes(packet.tailored);
      downloadPdf(
        bytes,
        `${slugify(profile.name)}-${slugify(job.company)}-packet-resume.pdf`,
      );
      downloadTextFile(
        `${slugify(profile.name)}-${slugify(job.company)}-application-packet.txt`,
        packet.plainText,
      );
      try { await navigator.clipboard.writeText(packet.plainText); } catch { /* clipboard may be blocked */ }
      pushActivity({
        type: "packet_built",
        title: `Application packet for ${job.title}`,
        detail: job.company,
      });
      toast.success("Packet ready — PDF + text downloaded, full text copied");
    } catch (e) {
      console.error(e);
      toast.error("Packet build failed");
    } finally {
      setBusy(null);
    }
  };

  const submitOutreach = () => {
    if (!outForm.contactName.trim()) {
      toast.error("Contact name required");
      return;
    }
    addOutreach(job.id, {
      contactName: outForm.contactName.trim(),
      contactRole: outForm.contactRole.trim() || undefined,
      channel: outForm.channel,
      status: outForm.status,
      note: outForm.note.trim(),
      nextFollowUp: outForm.nextFollowUp || undefined,
    });
    setOutForm({
      contactName: "",
      contactRole: "",
      channel: "linkedin",
      status: "planned",
      note: "",
      nextFollowUp: "",
    });
    toast.success("Outreach logged");
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
            <Button
              size="sm"
              variant="secondary"
              disabled={busy !== null}
              onClick={() => void runPacket()}
            >
              {busy === "packet" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Package className="h-3.5 w-3.5" />
              )}
              Application packet
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
            <div className="max-h-36 overflow-y-auto rounded-[var(--radius-md)] border border-border bg-surface p-3 text-sm leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>
          </section>

          {/* 3. One-click application packet */}
          <section className="rounded-[var(--radius-lg)] border border-primary/30 overflow-hidden">
            <div className="border-b border-border bg-primary-soft/50 px-4 py-3">
              <div className="inline-flex items-center gap-1.5 text-primary text-xs font-semibold uppercase tracking-wider">
                <Package className="h-3.5 w-3.5" />
                Application packet
              </div>
              <p className="text-sm text-muted mt-1">
                One click: tailored PDF + cover letter + LinkedIn note + story
                list. Downloads files and copies the full packet.
              </p>
            </div>
            <div className="p-4 space-y-3">
              <Button
                className="w-full"
                disabled={busy !== null}
                onClick={() => void runPacket()}
              >
                {busy === "packet" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Package className="h-4 w-4" />
                )}
                Build & download packet
              </Button>
              {linkedIn && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted">LinkedIn note</div>
                  <Textarea
                    value={linkedIn}
                    onChange={(e) => {
                      setLinkedIn(e.target.value);
                      const a = app ?? ensureApplication(job.id);
                      if (a)
                        updateApplication(a.id, {
                          linkedInNote: e.target.value,
                        });
                    }}
                    rows={5}
                    className="text-sm"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Tailored resume + PDF */}
          <section className="rounded-[var(--radius-lg)] border border-border overflow-hidden">
            <div className="border-b border-border bg-primary-soft/40 px-4 py-3">
              <div className="inline-flex items-center gap-1.5 text-primary text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                Tailored resume
              </div>
            </div>
            <div className="p-4 space-y-3">
              <label className="block text-xs font-medium text-muted">
                Base resume
                <select
                  value={variantId}
                  onChange={(e) => {
                    setVariantId(e.target.value as ResumeVariantId);
                    setTailored(null);
                  }}
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
                  variant="outline"
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
                <div className="space-y-2 rounded-[var(--radius-md)] border border-border bg-surface p-3">
                  <Badge variant="secondary">ATS {tailored.atsScore}%</Badge>
                  <p className="text-sm font-medium">{tailored.tailoredHeadline}</p>
                  <p className="text-sm text-muted">{tailored.tailoredSummary}</p>
                  <div className="flex flex-wrap gap-1">
                    {tailored.matchedKeywords.slice(0, 10).map((k) => (
                      <Badge key={k} variant="outline">
                        {k}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 1. Outreach / network tracker */}
          <section className="rounded-[var(--radius-lg)] border border-border overflow-hidden">
            <div className="border-b border-border bg-surface px-4 py-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                <Network className="h-3.5 w-3.5 text-primary" />
                Outreach & network
              </div>
              <p className="text-sm text-muted mt-1">
                Who can open a door—and what you did about it.
              </p>
            </div>
            <div className="p-4 space-y-3">
              <label className="block text-xs font-medium text-muted">
                Referral path
                <Input
                  className="mt-1"
                  placeholder="e.g. Ex-ON24 AE → hiring manager intro"
                  value={referralPath}
                  onChange={(e) => {
                    setReferralPath(e.target.value);
                    const a = app ?? ensureApplication(job.id);
                    if (a)
                      updateApplication(a.id, {
                        referralPath: e.target.value,
                      });
                  }}
                />
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Contact name"
                  value={outForm.contactName}
                  onChange={(e) =>
                    setOutForm((f) => ({ ...f, contactName: e.target.value }))
                  }
                />
                <Input
                  placeholder="Role (optional)"
                  value={outForm.contactRole}
                  onChange={(e) =>
                    setOutForm((f) => ({ ...f, contactRole: e.target.value }))
                  }
                />
                <select
                  className="h-10 rounded-[var(--radius-md)] border border-border px-2 text-sm"
                  value={outForm.channel}
                  onChange={(e) =>
                    setOutForm((f) => ({
                      ...f,
                      channel: e.target.value as OutreachChannel,
                    }))
                  }
                >
                  {CHANNELS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  className="h-10 rounded-[var(--radius-md)] border border-border px-2 text-sm"
                  value={outForm.status}
                  onChange={(e) =>
                    setOutForm((f) => ({
                      ...f,
                      status: e.target.value as OutreachStatus,
                    }))
                  }
                >
                  {STATUSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <Input
                  type="date"
                  className="sm:col-span-2"
                  value={outForm.nextFollowUp}
                  onChange={(e) =>
                    setOutForm((f) => ({
                      ...f,
                      nextFollowUp: e.target.value,
                    }))
                  }
                />
                <Textarea
                  className="sm:col-span-2"
                  placeholder="Note"
                  rows={2}
                  value={outForm.note}
                  onChange={(e) =>
                    setOutForm((f) => ({ ...f, note: e.target.value }))
                  }
                />
              </div>
              <Button size="sm" variant="outline" onClick={submitOutreach}>
                <Plus className="h-3.5 w-3.5" />
                Log outreach
              </Button>
              <div className="space-y-2">
                {(app?.outreach ?? []).map((o) => (
                  <div
                    key={o.id}
                    className="rounded-[var(--radius-md)] border border-border p-3 text-sm space-y-1"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium">
                        <Users className="inline h-3.5 w-3.5 mr-1 text-muted" />
                        {o.contactName}
                        {o.contactRole ? (
                          <span className="text-muted font-normal">
                            {" "}
                            · {o.contactRole}
                          </span>
                        ) : null}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-danger h-8 w-8 p-0"
                        onClick={() => removeOutreach(job.id, o.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline">{o.channel}</Badge>
                      <select
                        className="h-7 text-xs border border-border rounded px-1 bg-surface-card"
                        value={o.status}
                        onChange={(e) =>
                          updateOutreach(job.id, o.id, {
                            status: e.target.value as OutreachStatus,
                          })
                        }
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {o.nextFollowUp && (
                        <Badge variant="warning">
                          Follow-up {o.nextFollowUp.slice(0, 10)}
                        </Badge>
                      )}
                    </div>
                    {o.note && (
                      <p className="text-muted text-xs leading-relaxed">
                        {o.note}
                      </p>
                    )}
                  </div>
                ))}
                {(app?.outreach ?? []).length === 0 && (
                  <p className="text-xs text-muted">
                    No outreach yet. Log a contact or referral path above.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* 2. Interview kit */}
          <section className="rounded-[var(--radius-lg)] border border-border overflow-hidden">
            <div className="border-b border-border bg-surface px-4 py-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                Interview kit
              </div>
              <p className="text-sm text-muted mt-1">
                Likely questions, mapped stories from your bank, talking points.
              </p>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase text-muted mb-2">
                  Lead with these stories
                </h4>
                <div className="space-y-2">
                  {kit.mappedStories.map((m) => {
                    const full = stories.find((s) => s.id === m.storyId);
                    return (
                      <div
                        key={m.storyId}
                        className="rounded-[var(--radius-md)] border border-border p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-medium">{m.title}</span>
                          <Badge variant="secondary">fit {m.score}</Badge>
                        </div>
                        <p className="text-xs text-muted mt-0.5">{m.why}</p>
                        {full && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="mt-1 h-8 px-2"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(storyPlainText(full));
                                toast.success("STAR copied");
                              } catch {
                                toast.message("Clipboard blocked");
                              }
                            }}
                          >
                            <Copy className="h-3 w-3" />
                            Copy STAR
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase text-muted mb-2">
                  Likely questions
                </h4>
                <ul className="space-y-1.5 text-sm list-disc pl-4 text-muted">
                  {kit.likelyQuestions.map((q) => (
                    <li key={q} className="leading-relaxed">
                      <span className="text-fg">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase text-muted mb-2">
                  Talking points
                </h4>
                <ul className="space-y-1.5 text-sm list-disc pl-4">
                  {kit.talkingPoints.map((t) => (
                    <li key={t} className="leading-relaxed text-muted">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase text-muted mb-2">
                  Questions to ask them
                </h4>
                <ul className="space-y-1.5 text-sm list-disc pl-4 text-muted">
                  {kit.questionsToAsk.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  const text = [
                    `Interview kit — ${job.title} @ ${job.company}`,
                    "",
                    "OPENERS",
                    ...kit.openers,
                    "",
                    "STORIES",
                    ...kit.mappedStories.map((m) => `• ${m.title} (${m.why})`),
                    "",
                    "QUESTIONS THEY MAY ASK",
                    ...kit.likelyQuestions.map((q, i) => `${i + 1}. ${q}`),
                    "",
                    "TALKING POINTS",
                    ...kit.talkingPoints.map((t) => `• ${t}`),
                    "",
                    "QUESTIONS TO ASK",
                    ...kit.questionsToAsk.map((q) => `• ${q}`),
                  ].join("\n");
                  try {
                    await navigator.clipboard.writeText(text);
                    toast.success("Interview kit copied");
                  } catch {
                    toast.message("Kit ready — copy manually if clipboard is blocked");
                  }
                }}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy full kit
              </Button>
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
                onClick={() => {
                  const letter = generateCoverLetter(job, profile);
                  setCover(letter);
                  const a = app ?? ensureApplication(job.id);
                  if (a) updateApplication(a.id, { coverLetter: letter });
                }}
              >
                Generate
              </Button>
            </div>
            {cover && (
              <Textarea
                value={cover}
                onChange={(e) => {
                  setCover(e.target.value);
                  if (app)
                    updateApplication(app.id, { coverLetter: e.target.value });
                }}
                rows={6}
              />
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const note =
                    linkedIn ??
                    buildLinkedInNote(job, profile, referralPath);
                  setLinkedIn(note);
                  const a = app ?? ensureApplication(job.id);
                  if (a) updateApplication(a.id, { linkedInNote: note });
                  toast.success("LinkedIn note drafted");
                }}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Draft LinkedIn note
              </Button>
            </div>
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
