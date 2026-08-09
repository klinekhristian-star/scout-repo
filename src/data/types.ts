export type WorkMode = "remote" | "hybrid" | "onsite";
export type Seniority =
  | "intern"
  | "junior"
  | "mid"
  | "senior"
  | "staff"
  | "lead"
  | "director";
export type ApplicationStage =
  | "saved"
  | "applied"
  | "phone"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export type AgentFrequency = "hourly" | "daily" | "weekly";

/** Structured job sources — JSON APIs + official RSS + ATS board JSON. */
export type JobBoardId =
  | "remotive"
  | "arbeitnow"
  | "remoteok"
  | "jobicy"
  | "himalayas"
  | "themuse"
  | "weworkremotely"
  | "adzuna"
  | "ats";

export type AtsProvider = "greenhouse" | "lever" | "ashby" | "workday";

export interface AtsTarget {
  id: string;
  provider: AtsProvider;
  /**
   * Board identifier:
   * - greenhouse / lever / ashby: board token (e.g. stripe, linear)
   * - workday: careers site host/path
   *   e.g. nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite
   */
  slug: string;
  company: string;
  enabled: boolean;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  workMode: WorkMode;
  seniority: Seniority;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  description: string;
  requirements: string[];
  skills: string[];
  benefits: string[];
  source: string;
  postedAt: string;
  /** Canonical apply / listing URL (absolute https preferred) */
  url: string;
  department?: string;
  applicants?: number;
}

export interface Profile {
  name: string;
  email: string;
  headline: string;
  location: string;
  openToRemote: boolean;
  openToHybrid: boolean;
  openToOnsite: boolean;
  targetTitles: string[];
  skills: string[];
  yearsExperience: number;
  salaryMin: number;
  preferredLocations: string[];
  resumeSummary: string;
  autoSaveMatchesAbove: number;
  notifyOnNewMatches: boolean;
}

export interface JobBoardSettings {
  remotive: boolean;
  arbeitnow: boolean;
  remoteok: boolean;
  jobicy: boolean;
  himalayas: boolean;
  themuse: boolean;
  weworkremotely: boolean;
  adzuna: boolean;
  adzunaAppId: string;
  adzunaAppKey: string;
  adzunaCountry: string;
  includeSeedJobs: boolean;
  defaultQuery: string;
  atsEnabled: boolean;
  atsTargets: AtsTarget[];
}

export interface BoardSyncStatus {
  board: JobBoardId;
  ok: boolean;
  count: number;
  error?: string;
  fetchedAt?: string;
  label?: string;
}

export interface SearchAgent {
  id: string;
  name: string;
  query: string;
  locations: string[];
  workModes: WorkMode[];
  seniorities: Seniority[];
  salaryMin?: number;
  skills: string[];
  sources: string[];
  frequency: AgentFrequency;
  enabled: boolean;
  minMatchScore: number;
  autoSave: boolean;
  createdAt: string;
  lastRunAt?: string;
  lastMatchCount: number;
  totalMatches: number;
}

export interface TailoredResumeSnapshot {
  baseVariantId: string;
  baseVariantName: string;
  tailoredHeadline: string;
  tailoredSummary: string;
  plainText: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  atsScore: number;
  generatedAt: string;
  prioritizedSkills?: string[];
  experienceBlocks?: string[];
  guidance?: string[];
  metrics?: Array<{ metric: string; label: string; detail: string }>;
  /** Real career roles with dates — preferred source for PDF/DOCX */
  experience?: import("@/lib/types").Experience[];
}

/** Network / outreach log entry on a pipeline application */
export type OutreachChannel =
  | "linkedin"
  | "email"
  | "referral"
  | "call"
  | "event"
  | "other";
export type OutreachStatus =
  | "planned"
  | "sent"
  | "replied"
  | "meeting"
  | "closed";

export interface OutreachEntry {
  id: string;
  contactName: string;
  contactRole?: string;
  channel: OutreachChannel;
  status: OutreachStatus;
  note: string;
  nextFollowUp?: string;
  createdAt: string;
  updatedAt: string;
}

/** STAR interview story in the personal story bank */
export interface InterviewStory {
  id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  tags: string[];
  brands?: string[];
  metrics?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  stage: ApplicationStage;
  matchScore: number;
  notes: string;
  appliedAt?: string;
  updatedAt: string;
  source: "manual" | "agent";
  agentId?: string;
  coverLetter?: string;
  tailoredResume?: TailoredResumeSnapshot;
  outreach?: OutreachEntry[];
  linkedInNote?: string;
  referralPath?: string;
}

export interface ActivityEvent {
  id: string;
  type:
    | "agent_run"
    | "match_found"
    | "application_created"
    | "stage_changed"
    | "agent_created"
    | "profile_updated"
    | "boards_synced"
    | "resume_tailored"
    | "outreach_logged"
    | "packet_built"
    | "story_updated";
  title: string;
  detail?: string;
  meta?: Record<string, string | number | boolean>;
  createdAt: string;
}

export interface MatchBreakdown {
  score: number;
  title: number;
  skills: number;
  location: number;
  salary: number;
  seniority: number;
  workMode: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface InterviewKit {
  likelyQuestions: string[];
  mappedStories: Array<{
    storyId: string;
    title: string;
    why: string;
    score: number;
  }>;
  talkingPoints: string[];
  questionsToAsk: string[];
  openers: string[];
}
