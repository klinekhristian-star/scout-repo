import type { Job, Profile, TailoredResumeSnapshot } from "@/data/types";
import { buildResumeDocx, downloadDocx } from "@/lib/docx-resume";
import { buildResumePdf, downloadPdf, slugify } from "@/lib/pdf-resume";
import type { Experience } from "@/lib/types";

function snapshotToExperience(
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
      experience: snapshotToExperience(result, job, profile.location),
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
