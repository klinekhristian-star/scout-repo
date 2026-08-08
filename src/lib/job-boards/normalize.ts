import type { Job, Seniority, WorkMode } from "@/data/types";

export function stripHtml(html: string): string {
  return (html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function guessWorkMode(location: string, text: string): WorkMode {
  const s = `${location} ${text}`.toLowerCase();
  if (/\bremote\b|work from home|distributed|anywhere\b/.test(s)) return "remote";
  if (/\bhybrid\b/.test(s)) return "hybrid";
  return "onsite";
}

function guessSeniority(title: string): Seniority {
  const t = title.toLowerCase();
  if (/\b(intern|internship)\b/.test(t)) return "intern";
  if (/\b(junior|jr\.?|entry)\b/.test(t)) return "junior";
  if (/\b(staff|principal)\b/.test(t)) return "staff";
  if (/\b(director|vp|vice president|head of|chief)\b/.test(t)) return "director";
  if (/\b(lead|manager)\b/.test(t)) return "lead";
  if (/\b(senior|sr\.?)\b/.test(t)) return "senior";
  return "mid";
}

function extractSkills(text: string): string[] {
  const bank = [
    "Go-to-Market Strategy",
    "Customer Engagement",
    "Virtual Events",
    "Webinars",
    "Marketing Technology",
    "Salesforce",
    "Marketo",
    "Eloqua",
    "Customer Success",
    "Retention Strategy",
    "Revenue Growth",
    "Enterprise SaaS",
    "Digital Experience Optimization",
    "Customer Journey Design",
    "Competitive Intelligence",
    "Executive Advisory",
    "Strategic Partnerships",
    "Cross-Functional Leadership",
    "Program Delivery",
    "SSO",
    "Analytics",
    "Product Marketing",
    "Demand Generation",
  ];
  const n = text.toLowerCase();
  return bank.filter((s) => n.includes(s.toLowerCase())).slice(0, 10);
}

export function buildJob(input: {
  id: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  url: string;
  source: string;
  postedAt?: string;
  salaryMin?: number;
  salaryMax?: number;
  department?: string;
  companyLogo?: string;
}): Job {
  const description = stripHtml(input.description || "");
  const location = input.location || "Remote";
  return {
    id: input.id,
    title: input.title.trim() || "Untitled role",
    company: input.company.trim() || "Unknown",
    location,
    workMode: guessWorkMode(location, description),
    seniority: guessSeniority(input.title),
    salaryMin: input.salaryMin,
    salaryMax: input.salaryMax,
    description: description || `${input.title} at ${input.company}`,
    requirements: [],
    skills: extractSkills(`${input.title} ${description}`),
    benefits: [],
    source: input.source,
    postedAt: input.postedAt || new Date().toISOString(),
    url: input.url,
    department: input.department,
    companyLogo: input.companyLogo,
  };
}
