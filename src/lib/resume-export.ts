import type { Job, Profile, TailoredResumeSnapshot } from "@/data/types";
import { buildResumeDocx, downloadDocx } from "@/lib/docx-resume";
import { buildResumePdf, downloadPdf, slugify } from "@/lib/pdf-resume";
import type { Experience } from "@/lib/types";
import { rolesForVariant } from "@/data/resume-library";
import type { ResumeVariantId } from "@/data/resume-library";

function experienceFromSnapshot(
  result: TailoredResumeSnapshot,
): Experience[] {
  if (result.experience?.length) {
    return result.experience.map((r) => ({ ...r, location: "" }));
  }
  const id = (result.baseVariantId || "impact") as ResumeVariantId;
  return rolesForVariant(id).map((r) => ({ ...r, location: "" }));
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
      experience: experienceFromSnapshot(result),
      education: [
        {
          id: "edu-1",
          school: "The Johns Hopkins University",
          degree:
            "Bachelor of Arts, Political Science | Minor: The Writing Seminars | Dean's List",
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
