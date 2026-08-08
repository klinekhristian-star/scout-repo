import type { Job } from "./types";

/** Fixed anchor so SSR and client render identical relative times. */
const ANCHOR = Date.parse("2026-08-08T12:00:00.000Z");

const daysAgo = (d: number) =>
  new Date(ANCHOR - d * 24 * 60 * 60 * 1000).toISOString();

export const SEED_JOBS: Job[] = [
  {
    id: "seed-gtm-1",
    title: "VP, Digital Customer Engagement",
    company: "Lumina Cloud",
    location: "Remote (US)",
    workMode: "remote",
    seniority: "director",
    salaryMin: 220000,
    salaryMax: 280000,
    description:
      "Lead digital customer engagement strategy for enterprise SaaS. Own webinar, virtual event, and lifecycle programs that convert engagement into pipeline and expansion revenue. Partner with Product Marketing, CS, and Sales on GTM motions for Fortune 500 accounts.",
    requirements: [
      "12+ years enterprise digital engagement or GTM leadership",
      "Proven virtual events / webinar program ownership at scale",
      "Executive stakeholder management",
      "MarTech fluency (Salesforce, Marketo or Eloqua)",
    ],
    skills: [
      "Customer Engagement",
      "Virtual Events",
      "Go-to-Market Strategy",
      "Marketing Technology",
      "Salesforce",
      "Enterprise SaaS",
      "Executive Advisory",
    ],
    benefits: ["Equity", "Remote-first", "Executive coach"],
    source: "Seed",
    postedAt: daysAgo(1),
    url: "https://example.com/jobs/lumina-vp-engagement",
    department: "Marketing",
  },
  {
    id: "seed-gtm-2",
    title: "Senior Director, Go-to-Market Strategy",
    company: "Harbor Analytics",
    location: "New York, NY / Hybrid",
    workMode: "hybrid",
    seniority: "director",
    salaryMin: 200000,
    salaryMax: 250000,
    description:
      "Define and operationalize GTM strategy across segments. Build competitive intelligence, web maturity assessments, and executive briefings that inform product and sales priorities.",
    requirements: [
      "10+ years GTM or strategy roles in B2B tech",
      "Strong analytical storytelling for C-level audiences",
      "Experience advising multi-product SaaS portfolios",
    ],
    skills: [
      "Go-to-Market Strategy",
      "Competitive Intelligence",
      "Executive Advisory",
      "Digital Experience Optimization",
      "Revenue Growth",
    ],
    benefits: ["Hybrid NYC", "Bonus", "Equity"],
    source: "Seed",
    postedAt: daysAgo(2),
    url: "https://example.com/jobs/harbor-gtm-sd",
    department: "Strategy",
  },
  {
    id: "seed-gtm-3",
    title: "Head of Marketing Technology",
    company: "Northline CX",
    location: "Remote (US East)",
    workMode: "remote",
    seniority: "lead",
    salaryMin: 185000,
    salaryMax: 230000,
    description:
      "Own the marketing technology ecosystem powering acquisition, retention, and revenue. Architect integrations across Salesforce, Marketo, and data platforms; guide SSO and enterprise security reviews.",
    requirements: [
      "Deep MarTech architecture experience",
      "Salesforce + marketing automation leadership",
      "Cross-functional program delivery",
    ],
    skills: [
      "Marketing Technology",
      "Salesforce",
      "Marketo",
      "Eloqua",
      "SSO",
      "Program Delivery",
      "Customer Journey Design",
    ],
    benefits: ["Remote", "Learning budget"],
    source: "Seed",
    postedAt: daysAgo(0),
    url: "https://example.com/jobs/northline-martech",
    department: "Marketing Ops",
  },
  {
    id: "seed-gtm-4",
    title: "VP Customer Success",
    company: "Atlas Engage",
    location: "Atlanta, GA (Hybrid)",
    workMode: "hybrid",
    seniority: "director",
    salaryMin: 210000,
    salaryMax: 260000,
    description:
      "Scale enterprise customer success with a focus on digital engagement programs, retention, and expansion. Build playbooks that move accounts from onboarding through multi-million programs.",
    requirements: [
      "Enterprise CS leadership",
      "Retention and expansion ownership",
      "Executive communication",
    ],
    skills: [
      "Customer Success",
      "Retention Strategy",
      "Customer Engagement",
      "Enterprise SaaS",
      "Stakeholder Management",
      "Revenue Growth",
    ],
    benefits: ["Hybrid Atlanta", "Equity"],
    source: "Seed",
    postedAt: daysAgo(3),
    url: "https://example.com/jobs/atlas-vp-cs",
    department: "Customer Success",
  },
  {
    id: "seed-gtm-5",
    title: "Principal, Digital Transformation Advisory",
    company: "Meridian Partners",
    location: "Remote",
    workMode: "remote",
    seniority: "lead",
    salaryMin: 190000,
    salaryMax: 240000,
    description:
      "Advise executive teams on closing the gap between GTM strategy and digital execution. Deliver competitive assessments, journey redesigns, and sponsorship/partner strategies for global brands.",
    requirements: [
      "Consulting or in-house advisory background",
      "Digital transformation or CX programs at enterprise scale",
      "Comfort leading multi-region programs",
    ],
    skills: [
      "Executive Advisory",
      "Digital Experience Optimization",
      "Strategic Partnerships",
      "Sponsorship Development",
      "Cross-Functional Leadership",
      "Go-to-Market Strategy",
    ],
    benefits: ["Fully remote", "Partner track"],
    source: "Seed",
    postedAt: daysAgo(4),
    url: "https://example.com/jobs/meridian-principal",
    department: "Advisory",
  },
  {
    id: "seed-gtm-6",
    title: "Director, Virtual Events & Webinars",
    company: "PulseStream",
    location: "Charleston, SC / Remote",
    workMode: "hybrid",
    seniority: "director",
    salaryMin: 160000,
    salaryMax: 200000,
    description:
      "Own virtual event strategy and execution for enterprise pipeline. Design high-touch digital experiences that convert webinars into qualified opportunities and deepen account engagement.",
    requirements: [
      "Virtual events leadership",
      "Pipeline contribution ownership",
      "Agency or platform vendor experience a plus",
    ],
    skills: [
      "Virtual Events",
      "Webinars",
      "Customer Engagement",
      "Customer Acquisition",
      "Program Delivery",
      "Enterprise Customer Engagement",
    ],
    benefits: ["Charleston hybrid option"],
    source: "Seed",
    postedAt: daysAgo(1),
    url: "https://example.com/jobs/pulsestream-ve",
    department: "Demand Gen",
  },
];

export function mergeJobCatalog(
  seed: Job[],
  live: Job[],
  manual: Job[],
  includeSeed: boolean,
): Job[] {
  const map = new Map<string, Job>();
  const put = (j: Job) => {
    if (!map.has(j.id)) map.set(j.id, j);
  };
  for (const j of manual) put(j);
  for (const j of live) put(j);
  if (includeSeed) for (const j of seed) put(j);
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
  );
}
