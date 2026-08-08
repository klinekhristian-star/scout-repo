import type { Experience, Job, MasterResume, TailoredResume } from "./types";

const STOP = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "have",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "our",
  "that",
  "the",
  "their",
  "this",
  "to",
  "we",
  "with",
  "you",
  "your",
  "will",
  "about",
  "role",
  "what",
  "who",
  "how",
  "plus",
  "must",
  "need",
  "nice",
  "looking",
  "join",
  "team",
  "work",
  "working",
  "using",
  "used",
  "across",
  "into",
  "over",
  "also",
  "more",
  "than",
  "such",
  "other",
  "years",
  "year",
  "including",
  "including",
  "experience",
  "strong",
  "excellent",
  "requirements",
  "responsibilities",
  "qualifications",
  "preferred",
  "bonus",
  "able",
]);

/** Multi-word phrases that matter for ATS matching */
const PHRASES = [
  "system design",
  "a/b testing",
  "core web vitals",
  "design systems",
  "product discovery",
  "cross-functional",
  "full-stack",
  "full stack",
  "machine learning",
  "rest apis",
  "ci/cd",
  "type script",
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w+#./\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractKeywords(description: string): string[] {
  const text = normalize(description);
  const found = new Set<string>();

  for (const phrase of PHRASES) {
    if (text.includes(phrase)) found.add(phrase);
  }

  const tokens = text.split(" ").filter((t) => {
    if (t.length < 3) return false;
    if (STOP.has(t)) return false;
    if (/^\d+$/.test(t)) return false;
    return true;
  });

  // Prefer tech-ish tokens and capitalized skills from original
  for (const t of tokens) {
    if (
      t.includes("js") ||
      t.includes("ts") ||
      t.includes("sql") ||
      t.includes("api") ||
      t.includes("react") ||
      t.includes("node") ||
      t.includes("aws") ||
      t.includes("graph") ||
      t.length >= 5
    ) {
      found.add(t);
    }
  }

  // Cap list size for scoring clarity
  return [...found].slice(0, 40);
}

function scoreText(text: string, keywords: string[]): number {
  const n = normalize(text);
  let score = 0;
  for (const k of keywords) {
    if (n.includes(k)) score += k.includes(" ") ? 3 : 1;
  }
  return score;
}

function rewriteSummary(
  resume: MasterResume,
  job: Job,
  matched: string[],
): string {
  const top = matched.slice(0, 6);
  const skillLine =
    top.length > 0
      ? ` Known for ${top.slice(0, 4).join(", ")}${top.length > 4 ? `, and ${top[4]}` : ""}.`
      : "";
  const base = resume.summary.replace(/\s+/g, " ").trim();
  const target = `Targeting the ${job.title} role at ${job.company}.`;
  // Keep authentic base, prepend target, lightly emphasize matched stack
  if (base.toLowerCase().includes(job.company.toLowerCase())) {
    return `${base}${skillLine ? " " + skillLine.trim() : ""}`;
  }
  return `${target} ${base}${skillLine}`;
}

function reorderSkills(skills: string[], keywords: string[]): string[] {
  return [...skills].sort((a, b) => {
    const sa = scoreText(a, keywords);
    const sb = scoreText(b, keywords);
    if (sb !== sa) return sb - sa;
    return a.localeCompare(b);
  });
}

function tailorExperience(
  experience: Experience[],
  keywords: string[],
): Experience[] {
  return experience
    .map((exp) => {
      const bullets = [...exp.bullets]
        .map((b) => ({ b, s: scoreText(b, keywords) }))
        .sort((a, b) => b.s - a.s)
        .map((x) => x.b);
      const roleScore =
        scoreText(`${exp.title} ${exp.company} ${bullets.join(" ")}`, keywords) +
        bullets.slice(0, 2).reduce((acc, b) => acc + scoreText(b, keywords), 0);
      return { ...exp, bullets, _score: roleScore };
    })
    .sort((a, b) => (b as Experience & { _score: number })._score - (a as Experience & { _score: number })._score)
    .map(({ _score: _s, ...rest }) => rest as Experience);
}

/**
 * Job description → ATS-aware tailored resume.
 * Pure client-side keyword alignment (no network). Honest about match gaps.
 */
export function tailorResumeToJob(
  resume: MasterResume,
  job: Job,
): TailoredResume {
  const keywords = extractKeywords(
    `${job.title}\n${job.company}\n${job.description}`,
  );
  const resumeBlob = [
    resume.summary,
    resume.skills.join(" "),
    ...resume.experience.flatMap((e) => [e.title, e.company, ...e.bullets]),
  ].join(" ");

  const matchedKeywords = keywords.filter((k) =>
    normalize(resumeBlob).includes(k),
  );
  const missingKeywords = keywords
    .filter((k) => !normalize(resumeBlob).includes(k))
    .slice(0, 12);

  const matchScore = Math.min(
    98,
    Math.round(
      (matchedKeywords.length / Math.max(keywords.length, 1)) * 100 *
        0.85 +
        Math.min(15, matchedKeywords.length),
    ),
  );

  return {
    summary: rewriteSummary(resume, job, matchedKeywords),
    skills: reorderSkills(resume.skills, keywords),
    experience: tailorExperience(resume.experience, keywords),
    education: resume.education,
    matchedKeywords: matchedKeywords.slice(0, 16),
    missingKeywords,
    matchScore,
    targetRole: job.title,
    targetCompany: job.company,
  };
}
