import type {
  Application,
  InterviewStory,
  Job,
  Profile,
  TailoredResumeSnapshot,
} from "@/data/types";
import { generateCoverLetter } from "@/lib/matching";
import { tailorResumeForJob } from "@/lib/tailor-resume";
import type { ResumeVariantId } from "@/data/resume-library";

export function buildLinkedInNote(
  job: Job,
  profile: Profile,
  referralPath?: string,
): string {
  const hook = referralPath?.trim()
    ? `I was pointed toward your ${job.title} search${referralPath.includes(" ") ? ` (${referralPath.split(/[,.]/)[0]})` : ""}.`
    : `I saw the ${job.title} opening on your team.`;
  return [
    `Hi — ${hook}`,
    ``,
    `I'm ${profile.name}, ${profile.headline}. I've led enterprise digital engagement and GTM programs (including multi-year work with brands like Microsoft, Dell, and SAP) and founded GTM Insights Group for executive advisory.`,
    ``,
    `I'd value a brief conversation on how this role is shaping pipeline and customer engagement at ${job.company}. Happy to share a tailored one-pager if useful.`,
    ``,
    `Thank you,`,
    profile.name,
  ].join("\n");
}

export interface ApplicationPacket {
  jobTitle: string;
  company: string;
  tailored: TailoredResumeSnapshot;
  coverLetter: string;
  linkedInNote: string;
  referralPath: string;
  interviewStoryTitles: string[];
  plainText: string;
  generatedAt: string;
}

export function buildApplicationPacket(opts: {
  job: Job;
  profile: Profile;
  application?: Application;
  stories?: InterviewStory[];
  variantId?: ResumeVariantId;
  existingTailored?: TailoredResumeSnapshot | null;
  existingCover?: string | null;
  existingLinkedIn?: string | null;
}): ApplicationPacket {
  const {
    job,
    profile,
    application,
    stories = [],
    variantId = "impact",
    existingTailored,
    existingCover,
    existingLinkedIn,
  } = opts;

  const tailored =
    existingTailored ??
    application?.tailoredResume ??
    tailorResumeForJob(job, profile, variantId);

  const coverLetter =
    existingCover?.trim() ||
    application?.coverLetter?.trim() ||
    generateCoverLetter(job, profile);

  const linkedInNote =
    existingLinkedIn?.trim() ||
    application?.linkedInNote?.trim() ||
    buildLinkedInNote(job, profile, application?.referralPath);

  const storyTitles = stories.slice(0, 4).map((s) => s.title);

  const plainText = [
    `APPLICATION PACKET — ${profile.name}`,
    `${job.title} @ ${job.company}`,
    `Generated ${new Date().toLocaleString()}`,
    ``,
    `=== TAILORED HEADLINE ===`,
    tailored.tailoredHeadline,
    ``,
    `=== TAILORED SUMMARY ===`,
    tailored.tailoredSummary,
    ``,
    `=== ATS KEYWORDS ===`,
    tailored.matchedKeywords.join(", "),
    `ATS alignment: ${tailored.atsScore}%`,
    ``,
    `=== COVER LETTER ===`,
    coverLetter,
    ``,
    `=== LINKEDIN NOTE ===`,
    linkedInNote,
    ``,
    application?.referralPath
      ? `=== REFERRAL PATH ===\n${application.referralPath}\n`
      : "",
    storyTitles.length
      ? `=== INTERVIEW STORIES TO LEAD WITH ===\n${storyTitles.map((t, i) => `${i + 1}. ${t}`).join("\n")}`
      : "",
    ``,
    `=== FULL TAILORED RESUME TEXT ===`,
    tailored.plainText,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    jobTitle: job.title,
    company: job.company,
    tailored,
    coverLetter,
    linkedInNote,
    referralPath: application?.referralPath ?? "",
    interviewStoryTitles: storyTitles,
    plainText,
    generatedAt: new Date().toISOString(),
  };
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
