import type { Job, Profile, TailoredResumeSnapshot } from "@/data/types";
import {
  type ResumeVariantId,
  getResumeVariant,
  rolesForVariant,
  RESUME_VARIANTS,
} from "@/data/resume-library";
import type { Experience } from "@/lib/types";

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9+.#]/g, " ");
}

function extractKeywords(blob: string): string[] {
  const stop = new Set([
    "and", "the", "for", "with", "from", "that", "this", "your", "our",
    "will", "have", "been", "are", "was", "were", "you", "all", "any",
    "job", "role", "work", "team", "ability", "years", "experience",
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

/**
 * Tailor = keep YOUR real roles/dates intact.
 * Rank bullets within each role for the job; reorder skills.
 * Never invent the target employer as a past role.
 * Applies to Impact, Full Executive, and Compact variants.
 */
export function tailorResumeForJob(
  job: Job,
  profile: Profile,
  variantId: ResumeVariantId = "impact",
): TailoredResumeSnapshot {
  const base = getResumeVariant(variantId);
  const keywords = extractKeywords(
    `${job.title} ${job.description} ${(job as { requirements?: string[] }).requirements?.join(" ") ?? ""} ${(job as { skills?: string[] }).skills?.join(" ") ?? ""}`,
  );

  const roles = rolesForVariant(variantId).map((role) => {
    const ranked = [...role.bullets]
      .map((b) => ({ b, s: scoreText(b, keywords) }))
      .sort((a, b) => b.s - a.s)
      .map((x) => x.b)
      .slice(0, base.maxBulletsPerRole);
    return {
      ...role,
      location: "",
      bullets: ranked,
    } satisfies Experience;
  });

  const corpus = [
    base.summary,
    base.headline,
    ...roles.flatMap((r) => [r.company, r.title, ...r.bullets]),
    ...base.expertise,
    profile.headline,
    profile.resumeSummary ?? "",
    ...(profile.skills ?? []),
  ].join(" ");

  const matchedKeywords = keywords.filter((k) => normalize(corpus).includes(k));
  const missingKeywords = keywords
    .filter((k) => !normalize(corpus).includes(k))
    .slice(0, 12);

  const prioritizedSkills = [...base.expertise].sort(
    (a, b) => scoreText(b, keywords) - scoreText(a, keywords),
  );

  // Role-tailored headline for every variant (Impact, Full, Compact)
  const roleTitle = (job.title || "").trim();
  const isExec = /\b(VP|Vice President|Director|Head|Principal|Chief|SVP|EVP)\b/i.test(
    roleTitle,
  );
  const tailoredHeadline = isExec
    ? roleTitle.split(/[|\\-]/)[0]!.trim().slice(0, 90)
    : base.headline ||
      "Enterprise Go-to-Market and Digital Customer Engagement Executive";
  const tailoredSummary = base.summary;

  const experienceBlocks = roles.flatMap((r) =>
    r.bullets.map((b) => `${r.company} - ${b}`),
  );

  const plainText = [
    "KHRISTIAN KLINE",
    tailoredHeadline,
    "Charleston, SC | Remote / Hybrid | Open to Relocation",
    "(864) 547-5974 | klinekhristian@gmail.com | linkedin.com/in/khriskline | gtm-insights.com",
    "",
    "SUMMARY",
    tailoredSummary,
    "",
    "EXPERIENCE",
    ...roles.flatMap((r) => [
      `${r.company} | ${r.title} | ${r.start} - ${r.end}`,
      ...r.bullets.map((b) => `- ${b}`),
      "",
    ]),
    "CORE EXPERTISE",
    prioritizedSkills.join(" | "),
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
      "Experience is your real chronology - bullets reordered for this posting.",
      missingKeywords.length
        ? `If truthful, consider proof points for: ${missingKeywords.slice(0, 4).join(", ")}.`
        : "Coverage against the posting is strong.",
    ],
    metrics: base.metrics,
    experience: roles,
  };
}

export function listResumeVariants() {
  return RESUME_VARIANTS;
}
