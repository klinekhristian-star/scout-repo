import type { Job, Profile, TailoredResumeSnapshot } from "@/data/types";
import {
  type ResumeVariantId,
  getResumeVariant,
  RESUME_VARIANTS,
} from "@/data/resume-library";

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9+.#]/g, " ");
}

function extractKeywords(blob: string): string[] {
  const stop = new Set([
    "and", "the", "for", "with", "from", "that", "this", "your", "our",
    "will", "have", "been", "are", "was", "were", "you", "all", "any",
  ]);
  const words = normalize(blob)
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w));
  const counts = new Map<string, number>();
  for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w)
    .slice(0, 40);
}

function scoreText(text: string, keywords: string[]) {
  const n = normalize(text);
  return keywords.reduce((s, k) => s + (n.includes(k) ? 1 : 0), 0);
}

export function tailorResumeForJob(
  job: Job,
  profile: Profile,
  variantId: ResumeVariantId = "impact",
): TailoredResumeSnapshot {
  const base = getResumeVariant(variantId);
  const keywords = extractKeywords(
    `${job.title} ${job.company} ${job.description} ${(job as { requirements?: string[] }).requirements?.join(" ") ?? ""} ${(job as { skills?: string[] }).skills?.join(" ") ?? ""}`,
  );

  const corpus = [
    base.summary,
    base.headline,
    ...base.outcomes,
    ...base.experienceBlocks,
    ...base.expertise,
    ...base.metrics.map((m) => `${m.label} ${m.detail}`),
    profile.headline,
    profile.resumeSummary,
    ...(profile.skills ?? []),
  ].join(" ");

  const matchedKeywords = keywords.filter((k) => normalize(corpus).includes(k));
  const missingKeywords = keywords
    .filter((k) => !normalize(corpus).includes(k))
    .slice(0, 12);

  const prioritizedSkills = [...base.expertise].sort(
    (a, b) => scoreText(b, keywords) - scoreText(a, keywords),
  );

  const experienceBlocks = [...base.outcomes, ...base.experienceBlocks]
    .map((b) => ({ b, s: scoreText(b, keywords) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.b)
    .slice(0, 6);

  const metrics = [...base.metrics].sort(
    (a, b) =>
      scoreText(`${a.label} ${a.detail}`, keywords) -
      scoreText(`${b.label} ${b.detail}`, keywords),
  );

  // Headline stays candidate-owned (no target-company name baked in)
  const tailoredHeadline =
    base.headline ||
    profile.headline ||
    (job.title.includes("VP") ||
    job.title.includes("Director") ||
    job.title.includes("Head")
      ? job.title.split(",")[0]!
      : profile.headline);

  // Summary = your story — no "Targeting X at Company" opener
  const tailoredSummary = [
    base.summary,
    matchedKeywords.length
      ? `Emphasized for this role: ${matchedKeywords.slice(0, 6).join(", ")}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const plainText = [
    profile.name,
    tailoredHeadline,
    profile.email,
    profile.location,
    "",
    "SUMMARY",
    tailoredSummary,
    "",
    "SIGNATURE METRICS",
    ...metrics.map((m) => `${m.metric} — ${m.label}: ${m.detail}`),
    "",
    "SELECTED OUTCOMES",
    ...experienceBlocks.map((b) => `• ${b}`),
    "",
    "CORE EXPERTISE",
    prioritizedSkills.join(" · "),
    "",
    `ATS keyword alignment: ${matchedKeywords.slice(0, 12).join(", ")}`,
  ].join("\n");

  const atsScore = Math.min(
    98,
    Math.round(
      (matchedKeywords.length / Math.max(keywords.length, 1)) * 85 +
        Math.min(15, matchedKeywords.length),
    ),
  );

  return {
    baseVariantId: base.id,
    baseVariantName: base.name,
    tailoredHeadline,
    tailoredSummary,
    plainText,
    matchedKeywords: matchedKeywords.slice(0, 16),
    missingKeywords,
    atsScore,
    generatedAt: new Date().toISOString(),
    prioritizedSkills: prioritizedSkills.slice(0, 12),
    experienceBlocks,
    guidance: [
      `Lead with ${matchedKeywords.slice(0, 3).join(", ") || "enterprise engagement outcomes"} in the first half-page.`,
      missingKeywords.length
        ? `If truthful, add proof points for: ${missingKeywords.slice(0, 4).join(", ")}.`
        : "Coverage against the posting is strong — keep the Impact one-pager.",
    ],
    metrics,
  };
}

export function listResumeVariants() {
  return RESUME_VARIANTS;
}
