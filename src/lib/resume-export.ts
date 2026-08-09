import type { Job, Profile, TailoredResumeSnapshot } from "@/data/types";
import { buildResumeDocx, downloadDocx } from "@/lib/docx-resume";
import { buildResumePdf, downloadPdf, slugify } from "@/lib/pdf-resume";
import type { Experience } from "@/lib/types";

/**
 * Build experience from YOUR career blocks (GTM Insights, ON24, etc.).
 * Never invent the target employer as a past role.
 */
function snapshotToExperience(
  result: TailoredResumeSnapshot,
  profileLocation: string,
): Experience[] {
  const metrics = result.metrics ?? [];
  const blocks = result.experienceBlocks ?? [];
  const roles: Experience[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!;
    const parts = block.split(/\s+[—–-]\s+/);
    const company = (parts[0] || "Career").trim();
    const rest = parts.slice(1).join(" — ").trim() || block;
    roles.push({
      id: `role-${i}`,
      company,
      title: rest.split(/[.]/)[0]?.slice(0, 90) || rest.slice(0, 90),
      location: profileLocation,
      start: "",
      end: i === 0 ? "Present" : "",
      bullets: [rest],
    });
  }

  if (metrics.length) {
    roles.unshift({
      id: "metrics",
      company: "Selected outcomes",
      title: "Role-aligned metrics",
      location: profileLocation,
      start: "",
      end: "",
      bullets: metrics
        .slice(0, 4)
        .map((m) => `${m.metric} — ${m.label}: ${m.detail}`),
    });
  }

  if (roles.length) return roles;

  return [
    {
      id: "career",
      company: "Professional experience",
      title: result.tailoredHeadline,
      location: profileLocation,
      start: "",
      end: "",
      bullets: blocks.slice(0, 6),
    },
  ];
}

function toPayload(profile: Profile, job: Job, result: TailoredResumeSnapshot) {
  return {
    profile: {
      fullName: profile.name,
      headline: result.tailoredHeadline,
      email: profile.email,
      phone: "",
      location: profile.location,
      links: [] as string[],
    },
    tailored: {
      summary: result.tailoredSummary,
      skills: result.prioritizedSkills ?? profile.skills,
      experience: snapshotToExperience(result, profile.location),
      education: [
        {
          id: "edu-1",
          school: "Johns Hopkins University",
          degree: "BA Political Science · Minor: The Writing Seminars",
          year: "",
        },
      ],
      matchedKeywords: result.matchedKeywords,
      missingKeywords: result.missingKeywords,
      matchScore: result.atsScore,
      targetRole: job.title,
      targetCompany: job.company,
    },
  };
}

export function exportTailoredPdf(
  profile: Profile,
  job: Job,
  result: TailoredResumeSnapshot,
) {
  const { profile: p, tailored } = toPayload(profile, job, result);
  const bytes = buildResumePdf(p, tailored);
  downloadPdf(
    bytes,
    `${slugify(profile.name)}-${slugify(job.company)}-${slugify(job.title)}-tailored.pdf`,
  );
}

export function exportTailoredDocx(
  profile: Profile,
  job: Job,
  result: TailoredResumeSnapshot,
) {
  const { profile: p, tailored } = toPayload(profile, job, result);
  const bytes = buildResumeDocx(p, tailored);
  downloadDocx(
    bytes,
    `${slugify(profile.name)}-${slugify(job.company)}-${slugify(job.title)}-tailored.docx`,
  );
}
