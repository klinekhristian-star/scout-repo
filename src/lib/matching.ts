import type {
  Job,
  MatchBreakdown,
  Profile,
  SearchAgent,
  Seniority,
  WorkMode,
} from "@/data/types";

const SENIORITY_RANK: Record<Seniority, number> = {
  intern: 0,
  junior: 1,
  mid: 2,
  senior: 3,
  staff: 4,
  lead: 5,
  director: 6,
};

function normalize(s: string) {
  return s.toLowerCase().trim();
}

function tokenOverlap(a: string, b: string) {
  const ta = new Set(
    normalize(a)
      .split(/[\s,/|&+-]+/)
      .filter(Boolean),
  );
  const tb = new Set(
    normalize(b)
      .split(/[\s,/|&+-]+/)
      .filter(Boolean),
  );
  let hit = 0;
  for (const t of ta) if (tb.has(t)) hit++;
  return ta.size === 0 ? 0 : hit / ta.size;
}

function skillMatch(profileSkills: string[], jobSkills: string[]) {
  const profile = profileSkills.map(normalize);
  const matched: string[] = [];
  const missing: string[] = [];
  for (const s of jobSkills) {
    const n = normalize(s);
    if (profile.some((p) => p === n || p.includes(n) || n.includes(p))) {
      matched.push(s);
    } else {
      missing.push(s);
    }
  }
  const score =
    jobSkills.length === 0
      ? 50
      : Math.round((matched.length / jobSkills.length) * 100);
  return { score, matched, missing };
}

export function scoreJob(job: Job, profile: Profile): MatchBreakdown {
  let titleScore = 20;
  if (profile.targetTitles.length > 0) {
    const best = Math.max(
      ...profile.targetTitles.map((t) =>
        Math.max(tokenOverlap(t, job.title), tokenOverlap(job.title, t)),
      ),
    );
    titleScore = Math.round(best * 100);
  } else {
    titleScore = 55;
  }

  const { score: skillsScore, matched, missing } = skillMatch(
    profile.skills,
    job.skills.length ? job.skills : job.requirements.slice(0, 8),
  );

  let locationScore = 50;
  const jobLoc = normalize(job.location);
  if (job.workMode === "remote" && profile.openToRemote) {
    locationScore = 100;
  } else if (
    profile.preferredLocations.some((l) => jobLoc.includes(normalize(l)))
  ) {
    locationScore = 90;
  } else if (job.workMode === "hybrid" && profile.openToHybrid) {
    locationScore = 75;
  } else if (job.workMode === "onsite" && profile.openToOnsite) {
    locationScore = 60;
  } else if (job.workMode === "remote" && !profile.openToRemote) {
    locationScore = 25;
  }

  let salaryScore = 60;
  if (job.salaryMax || job.salaryMin) {
    const mid =
      ((job.salaryMin ?? job.salaryMax!) + (job.salaryMax ?? job.salaryMin!)) /
      2;
    if (mid >= profile.salaryMin) salaryScore = 100;
    else if (mid >= profile.salaryMin * 0.85) salaryScore = 70;
    else salaryScore = 35;
  }

  // Map years to preferred seniority band (exec profile → director/lead/staff)
  const preferred: Seniority =
    profile.yearsExperience >= 20
      ? "director"
      : profile.yearsExperience >= 12
        ? "lead"
        : profile.yearsExperience >= 8
          ? "staff"
          : profile.yearsExperience >= 5
            ? "senior"
            : "mid";
  const diff = Math.abs(SENIORITY_RANK[job.seniority] - SENIORITY_RANK[preferred]);
  const seniorityScore = Math.max(20, 100 - diff * 18);

  let workModeScore = 50;
  if (job.workMode === "remote" && profile.openToRemote) workModeScore = 100;
  else if (job.workMode === "hybrid" && profile.openToHybrid) workModeScore = 90;
  else if (job.workMode === "onsite" && profile.openToOnsite) workModeScore = 80;
  else workModeScore = 30;

  const score = Math.round(
    titleScore * 0.28 +
      skillsScore * 0.28 +
      locationScore * 0.14 +
      salaryScore * 0.1 +
      seniorityScore * 0.12 +
      workModeScore * 0.08,
  );

  return {
    score: Math.min(99, Math.max(5, score)),
    title: titleScore,
    skills: skillsScore,
    location: locationScore,
    salary: salaryScore,
    seniority: seniorityScore,
    workMode: workModeScore,
    matchedSkills: matched,
    missingSkills: missing,
  };
}

export function jobMatchesAgent(job: Job, agent: SearchAgent, profile: Profile) {
  if (agent.workModes.length && !agent.workModes.includes(job.workMode)) {
    return false;
  }
  if (agent.seniorities.length && !agent.seniorities.includes(job.seniority)) {
    return false;
  }
  if (agent.salaryMin && (job.salaryMax ?? job.salaryMin ?? 0) < agent.salaryMin) {
    return false;
  }
  if (agent.locations.length) {
    const loc = job.location.toLowerCase();
    const remoteOk =
      job.workMode === "remote" &&
      agent.locations.some((l) => l.toLowerCase().includes("remote"));
    const locHit = agent.locations.some((l) =>
      loc.includes(l.toLowerCase()),
    );
    if (!remoteOk && !locHit && job.workMode !== "remote") return false;
  }
  if (agent.query.trim()) {
    const hay =
      `${job.title} ${job.company} ${job.description} ${job.skills.join(" ")}`.toLowerCase();
    const tokens = agent.query.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = tokens.filter((t) => hay.includes(t)).length;
    if (hits < Math.min(2, tokens.length)) return false;
  }
  if (agent.skills.length) {
    const { matched } = skillMatch(job.skills, agent.skills);
    if (matched.length === 0) {
      // soft: allow title/query hits to carry
      const hay = `${job.title} ${job.description}`.toLowerCase();
      if (!agent.skills.some((s) => hay.includes(s.toLowerCase()))) return false;
    }
  }
  const { score } = scoreJob(job, profile);
  return score >= agent.minMatchScore;
}

export function generateCoverLetter(job: Job, profile: Profile): string {
  const { matchedSkills, score } = scoreJob(job, profile);
  const skillsLine =
    matchedSkills.slice(0, 5).join(", ") || profile.skills.slice(0, 5).join(", ");
  return [
    `Dear ${job.company} Hiring Team,`,
    ``,
    `I'm writing to express interest in the ${job.title} role. ${profile.resumeSummary}`,
    ``,
    `My background aligns particularly well with your focus on ${skillsLine}. Across enterprise programs I have partnered with global brands to connect go-to-market strategy, digital engagement, and measurable revenue outcomes—exactly the mandate this role describes.`,
    ``,
    `I would welcome a conversation about how I can help ${job.company} deepen customer engagement and accelerate pipeline. Thank you for your consideration.`,
    ``,
    `Sincerely,`,
    profile.name,
    `(Match signal: ${score}% · ${profile.email})`,
  ].join("\n");
}
