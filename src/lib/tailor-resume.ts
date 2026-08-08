import type { Job, Profile, TailoredResumeSnapshot } from "@/data/types";
import {
  getResumeVariant,
  type ResumeVariantId,
  RESUME_VARIANTS,
} from "@/data/resume-library";

const STOP = new Set(
  "a an and are as at be by for from has have in is it of on or the to with your our their this that will role job about what who how".split(
    " ",
  ),
);

function normalize(s: string) {
  return s.toLowerCase().replace(/[^\w+#./\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function extractKeywords(job: Job): string[] {
  const text = normalize(
    `${job.title} ${job.company} ${job.description} ${job.requirements.join(" ")} ${job.skills.join(" ")}`,
  );
  const found = new Set<string>();
  for (const s of job.skills) found.add(normalize(s));
  for (const tok of text.split(" ")) {
    if (tok.length < 4 || STOP.has(tok)) continue;
    if (
      /engagement|marketing|customer|digital|strategy|revenue|salesforce|marketo|webinar|event|enterprise|saas|pipeline|retention|gtm|advisory|partner/.test(
        tok,
      ) ||
      tok.length >= 6
    ) {
      found.add(tok);
    }
  }
  return [...found].slice(0, 36);
}

function scoreText(text: string, keywords: string[]) {
  const n = normalize(text);
  return keywords.reduce((acc, k) => acc + (n.includes(k) ? (k.includes(" ") ? 3 : 1) : 0), 0);
}

export function tailorResumeForJob(
  job: Job,
  profile: Profile,
  variantId: ResumeVariantId = "impact",
): TailoredResumeSnapshot {
  const base = getResumeVariant(variantId);
  const keywords = extractKeywords(job);
  const corpus = [
    base.summary,
    base.headline,
    ...base.expertise,
    ...base.outcomes,
    ...base.experienceBlocks,
    profile.resumeSummary,
    ...profile.skills,
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

  const tailoredHeadline = `${job.title.includes("VP") || job.title.includes("Director") || job.title.includes("Head") ? job.title.split(",")[0] : profile.headline.split("·")[0]?.trim()} · ${job.company} focus`;

  const tailoredSummary = [
    `Targeting ${job.title} at ${job.company}.`,
    base.summary,
    matchedKeywords.length
      ? `Aligned strengths: ${matchedKeywords.slice(0, 6).join(", ")}.`
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
