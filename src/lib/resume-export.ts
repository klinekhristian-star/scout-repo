import type { Job, Profile, TailoredResumeSnapshot } from "@/data/types";
import { buildResumeDocx, downloadDocx } from "@/lib/docx-resume";
import { buildResumePdf, downloadPdf, slugify } from "@/lib/pdf-resume";
import type { Experience } from "@/lib/types";
import { rolesForVariant } from "@/data/resume-library";
import type { ResumeVariantId } from "@/data/resume-library";

/** Always-on contact block for every tailored resume */
const FIXED_CONTACT = {
  fullName: "KHRISTIAN KLINE",
  phone: "(864) 547-5974",
  email: "klinekhristian@gmail.com",
  locationLine: "Charleston, SC | Remote / Hybrid | Open to Relocation",
  links: ["linkedin.com/in/khriskline", "gtm-insights.com"],
};

/**
 * Headline tailored to the target role while staying executive-positioning.
 */
export function headlineForJob(job: Job, fallback?: string): string {
  const raw = (job.title || "").trim();
  if (!raw) {
    return (
      fallback ||
      "Enterprise Go-to-Market and Digital Customer Engagement Executive"
    );
  }
  const executive =
    /\b(VP|Vice President|Director|Head|Principal|Chief|SVP|EVP)\b/i.test(raw);
  if (executive) {
    return raw.split(/[|\\-]/)[0]!.trim().slice(0, 90);
  }
  return "Enterprise Go-to-Market and Digital Customer Engagement Executive";
}

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
  const headline =
    result.tailoredHeadline?.includes("Go-to-Market") ||
    result.tailoredHeadline?.includes("Director") ||
    result.tailoredHeadline?.includes("VP")
      ? result.tailoredHeadline
      : headlineForJob(job, result.tailoredHeadline);

  return {
    profile: {
      fullName: FIXED_CONTACT.fullName,
      headline,
      email: FIXED_CONTACT.email,
      phone: FIXED_CONTACT.phone,
      location: FIXED_CONTACT.locationLine,
      links: FIXED_CONTACT.links,
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
    `${slugify(FIXED_CONTACT.fullName)}-${slugify(job.company)}-${slugify(job.title)}-tailored.pdf`,
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
    `${slugify(FIXED_CONTACT.fullName)}-${slugify(job.company)}-${slugify(job.title)}-tailored.docx`,
  );
}
