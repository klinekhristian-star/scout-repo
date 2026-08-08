export type JobStatus =
  | "saved"
  | "applied"
  | "interview"
  | "offer"
  | "rejected";

export interface Experience {
  id: string;
  company: string;
  title: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  year: string;
}

export interface MasterResume {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  links: string[];
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  url?: string;
  status: JobStatus;
  salary?: string;
  postedAt: string;
  description: string;
  notes?: string;
  tailoredAt?: string;
  matchScore?: number;
  matchedKeywords?: string[];
}

export interface TailoredResume {
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  matchedKeywords: string[];
  missingKeywords: string[];
  matchScore: number;
  targetRole: string;
  targetCompany: string;
}
