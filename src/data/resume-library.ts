import type { Experience } from "@/lib/types";

export type ResumeVariantId = "impact" | "full" | "compact";

export interface ResumeVariant {
  id: ResumeVariantId;
  name: string;
  description: string;
  headline: string;
  summary: string;
  expertise: string[];
  /** Role ids from CAREER_ROLES to include, in order */
  roleIds: string[];
  /** Max bullets per role after ranking */
  maxBulletsPerRole: number;
  metrics: Array<{ metric: string; label: string; detail: string }>;
}

/**
 * Canonical career history — refined from Executive Impact + Full Executive resumes.
 * Bullets are metric-led, single-idea, ATS-friendly. No city. Dates preserved.
 */
export const CAREER_ROLES: Experience[] = [
  {
    id: "gtm-insights",
    company: "GTM Insights Group",
    title: "Founder & Principal",
    location: "",
    start: "June 2026",
    end: "Present",
    bullets: [
      "Advise enterprise leadership on closing the gap between GTM strategy and digital execution—turning experience, analytics, and engagement programs into measurable acquisition, retention, and revenue gains.",
      "Lead GTM strategy, learner acquisition, and digital presence for a skilled-trades Driller Academy backed by a $116K Wisconsin Fast Forward Workforce Grant.",
      "Build reusable frameworks for GTM maturity assessments, competitive intelligence, digital experience optimization, and acquisition/retention analytics.",
    ],
  },
  {
    id: "on24-sde",
    company: "ON24",
    title: "Senior Director, Strategic Events",
    location: "",
    start: "2022",
    end: "June 2026",
    bullets: [
      "Grew Microsoft from an initial product demo to $2.1M ARR over seven years across webcasting and virtual environments; led migration to ON24 GoLive.",
      "Designed and scaled Home Depot Path to Pro (skilled-trades training + youth companion program ages 14–18), growing the account from ~$200K to $400K through utilization and program expansion.",
      "Directed 50+ global virtual events and 500+ enterprise webcasts annually (~$1.8M revenue) across NA, EMEA, APAC, and Latin America for executive communications, launches, and demand gen.",
      "Led MarTech integrations (Salesforce, Marketo, Eloqua, Microsoft Dynamics) and coordinated SAML/SSO for complex enterprise clients with Engineering.",
      "Built trusted advisory relationships with Dell, SAP, IBM, Lenovo, Citibank, and Merck on digital engagement strategy, webinar optimization, and audience growth.",
      "Partnered with Product and Engineering to influence platform roadmap; delivered executive analytics that informed customer engagement and marketing investment decisions.",
    ],
  },
  {
    id: "on24-earlier",
    company: "ON24",
    title: "Senior Manager, VS Operations & Virtual Events",
    location: "",
    start: "2012",
    end: "2022",
    bullets: [
      "Progressed Virtual Event Manager → Senior Manager, Virtual Events (led team of 5) → Senior Manager, VS Operations, supporting top-tier enterprise delivery.",
      "Served as strategic point of contact bridging client goals with platform capabilities for the most complex global engagements.",
      "Standardized event execution processes to scale quality and throughput as demand grew.",
    ],
  },
  {
    id: "interactive-knowledge",
    company: "Interactive Knowledge",
    title: "Executive Producer, Project Manager & Business Development",
    location: "",
    start: "2011",
    end: "2012",
    bullets: [
      "Led end-to-end delivery of interactive digital experiences with cross-functional teams of producers, designers, and developers alongside a Webby Award–winning studio.",
      "Primary client lead for institutional programs including the Mint Museum, WDAV Classical Radio, and Reynolda House Museum of American Art.",
    ],
  },
  {
    id: "k2media",
    company: "K2MEDIA",
    title: "Managing Partner & Executive Producer",
    location: "",
    start: "2007",
    end: "2012",
    bullets: [
      "Founded digital consultancy focused on interactive technology, strategic partnerships, and customer experience for growth-stage and enterprise clients.",
      "Directed digital transformation for RoundPoint Financial (portals, web, mobile, interactive video).",
      "Secured multi-year $500K Hard Rock Cafe title sponsorship for Little Steven's Underground Garage / Renegade Nation.",
    ],
  },
  {
    id: "tribeca-res",
    company: "Tribeca Enterprises & RES Media Group",
    title: "Executive Producer / Business Development Director",
    location: "",
    start: "2002",
    end: "2007",
    bullets: [
      "Helped launch Tomorrow Unlimited for the Tribeca Film Festival; drove digital strategy and sponsorship with Apple, Canon, Getty Images, Diesel, and other national brands.",
      "Generated $1.2M+ annual revenue at RES Media and expanded RESFEST into 40+ international cities; founded RES LAB integrated marketing division.",
      "As Associate Publisher of RES Magazine, generated ~$800K annual advertising revenue; produced major campaigns for Panasonic, Nike, InBev, Diesel, Canon, and Getty.",
    ],
  },
];

const EXPERTISE = [
  "Go-to-Market Strategy & Execution",
  "Digital Experience Optimization",
  "Customer Journey Design",
  "Enterprise Customer Engagement & Virtual Events",
  "Customer & Learner Acquisition, Retention & Revenue Growth",
  "Marketing Technology Ecosystems (Salesforce, Marketo, Eloqua, SSO)",
  "Competitive Intelligence & Web Maturity Assessments",
  "Executive Advisory & Stakeholder Management",
  "Strategic Partnerships & Sponsorship Development",
  "Cross-Functional Leadership & Program Delivery",
];

const SUMMARY =
  "Enterprise go-to-market executive with 25+ years leading digital customer engagement—from New York's Silicon Alley through enterprise SaaS and executive advisory. Known for helping Fortune 500 organizations turn complex platforms into measurable business outcomes by aligning GTM strategy, customer experience, MarTech, and executive decision-making. Nearly 15 years at ON24 as a trusted advisor to Microsoft, Home Depot, Dell, SAP, IBM, Lenovo, Citibank, and Merck. Founder of GTM Insights Group, advising leadership teams on closing the gap between GTM strategy and digital execution.";

export const RESUME_VARIANTS: ResumeVariant[] = [
  {
    id: "impact",
    name: "Executive Impact",
    description: "One-page metrics-forward; core roles only",
    headline:
      "Enterprise Go-to-Market Executive · Customer Engagement · Marketing Technology",
    summary: SUMMARY,
    expertise: EXPERTISE,
    roleIds: ["gtm-insights", "on24-sde", "on24-earlier", "tribeca-res"],
    maxBulletsPerRole: 4,
    metrics: [
      {
        metric: "$2.1M ARR",
        label: "Microsoft account",
        detail: "Demo to $2.1M over seven years; GoLive migration",
      },
      {
        metric: "2× Account",
        label: "Home Depot Path to Pro",
        detail: "~$200K → $400K skilled-trades program",
      },
      {
        metric: "$1.8M / yr",
        label: "Global virtual events",
        detail: "50+ events and 500+ webcasts annually",
      },
      {
        metric: "$1.2M+",
        label: "Earlier revenue",
        detail: "RES Media / RESFEST expansion",
      },
    ],
  },
  {
    id: "full",
    name: "Full Executive",
    description: "Full chronology for traditional ATS forms",
    headline:
      "Enterprise Go-to-Market Executive | Customer Engagement | MarTech | SaaS",
    summary: SUMMARY,
    expertise: EXPERTISE,
    roleIds: [
      "gtm-insights",
      "on24-sde",
      "on24-earlier",
      "interactive-knowledge",
      "k2media",
      "tribeca-res",
    ],
    maxBulletsPerRole: 6,
    metrics: [],
  },
  {
    id: "compact",
    name: "Compact",
    description: "Tight summary for quick applications",
    headline: "GTM & Digital Engagement Executive",
    summary:
      "Enterprise GTM and digital engagement leader. ON24 alumni; founder of GTM Insights Group. Specializes in virtual events, MarTech, and executive advisory for B2B growth.",
    expertise: EXPERTISE.slice(0, 6),
    roleIds: ["gtm-insights", "on24-sde"],
    maxBulletsPerRole: 3,
    metrics: [],
  },
];

export function getResumeVariant(id: ResumeVariantId): ResumeVariant {
  return RESUME_VARIANTS.find((v) => v.id === id) ?? RESUME_VARIANTS[0]!;
}

export function rolesForVariant(id: ResumeVariantId): Experience[] {
  const v = getResumeVariant(id);
  return v.roleIds
    .map((rid) => CAREER_ROLES.find((r) => r.id === rid))
    .filter((r): r is Experience => Boolean(r))
    .map((r) => ({ ...r, bullets: [...r.bullets] }));
}
