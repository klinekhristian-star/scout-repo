import type { Experience } from "@/lib/types";

export type ResumeVariantId = "impact" | "full" | "compact";

export interface ResumeVariant {
  id: ResumeVariantId;
  name: string;
  description: string;
  headline: string;
  summary: string;
  expertise: string[];
  roleIds: string[];
  maxBulletsPerRole: number;
  metrics: Array<{ metric: string; label: string; detail: string }>;
}

/**
 * Canonical career history for tailored resumes.
 * ATS rules: ASCII punctuation only, action verb first, one idea per bullet,
 * metrics explicit, no tables/columns/icons, consistent date format.
 */
export const CAREER_ROLES: Experience[] = [
  {
    id: "gtm-insights",
    company: "GTM Insights Group",
    title: "Founder and Principal",
    location: "",
    start: "06/2026",
    end: "Present",
    bullets: [
      "Advise enterprise leadership on aligning go-to-market strategy with digital execution to drive measurable acquisition, retention, and revenue outcomes.",
      "Lead GTM strategy, learner acquisition, and digital presence for a skilled-trades Driller Academy funded by a $116K Wisconsin Fast Forward Workforce Grant.",
      "Build frameworks for GTM maturity assessments, competitive intelligence, digital experience optimization, and acquisition and retention analytics.",
    ],
  },
  {
    id: "on24-sde",
    company: "ON24",
    title: "Senior Director, Strategic Events",
    location: "",
    start: "01/2022",
    end: "06/2026",
    bullets: [
      "Grew the Microsoft account from an initial product demo to $2.1M ARR over seven years across webcasting and virtual environments; led migration to ON24 GoLive.",
      "Designed and scaled Home Depot Path to Pro skilled-trades training program, including a youth companion site for ages 14-18, growing the account from $200K to $400K.",
      "Directed 50+ global virtual events and 500+ enterprise webcasts annually representing approximately $1.8M in revenue across North America, EMEA, APAC, and Latin America.",
      "Led MarTech integrations with Salesforce, Marketo, Eloqua, and Microsoft Dynamics; coordinated SAML and SSO implementation for enterprise clients with Engineering.",
      "Advised Dell, SAP, IBM, Lenovo, Citibank, and Merck on digital engagement strategy, webinar optimization, and audience growth.",
      "Partnered with Product and Engineering to influence platform roadmap and delivered executive analytics that informed customer engagement and marketing investment decisions.",
    ],
  },
  {
    id: "on24-earlier",
    company: "ON24",
    title: "Senior Manager, VS Operations and Virtual Events",
    location: "",
    start: "01/2012",
    end: "12/2021",
    bullets: [
      "Progressed from Virtual Event Manager to Senior Manager, Virtual Events (led a team of 5), then Senior Manager, VS Operations supporting top-tier enterprise delivery.",
      "Served as strategic point of contact bridging client goals with platform capabilities for complex global engagements.",
      "Standardized event execution processes to scale delivery quality and throughput as client demand grew.",
    ],
  },
  {
    id: "interactive-knowledge",
    company: "Interactive Knowledge",
    title: "Executive Producer, Project Manager and Business Development",
    location: "",
    start: "01/2011",
    end: "12/2012",
    bullets: [
      "Led end-to-end delivery of interactive digital experiences with cross-functional teams of producers, designers, and developers alongside a Webby Award-winning studio.",
      "Served as primary client lead for institutional programs including the Mint Museum, WDAV Classical Radio, and Reynolda House Museum of American Art.",
    ],
  },
  {
    id: "k2media",
    company: "K2MEDIA",
    title: "Managing Partner and Executive Producer",
    location: "",
    start: "01/2007",
    end: "12/2012",
    bullets: [
      "Founded a digital consultancy focused on interactive technology, strategic partnerships, and customer experience for growth-stage and enterprise clients.",
      "Directed digital transformation for RoundPoint Financial spanning customer portals, web properties, mobile applications, and interactive video.",
      "Secured a multi-year $500K Hard Rock Cafe title sponsorship for Little Steven's Underground Garage and Renegade Nation.",
    ],
  },
  {
    id: "tribeca-res",
    company: "Tribeca Enterprises and RES Media Group",
    title: "Executive Producer / Business Development Director",
    location: "",
    start: "01/2002",
    end: "12/2007",
    bullets: [
      "Helped launch Tomorrow Unlimited for the Tribeca Film Festival and drove digital strategy and sponsorship with Apple, Canon, Getty Images, Diesel, and other national brands.",
      "Generated $1.2M+ annual revenue at RES Media and expanded RESFEST into 40+ international cities; founded the RES LAB integrated marketing division.",
      "Generated approximately $800K annual advertising revenue as Associate Publisher of RES Magazine; produced campaigns for Panasonic, Nike, InBev, Diesel, Canon, and Getty Images.",
    ],
  },
];

const EXPERTISE = [
  "Go-to-Market Strategy and Execution",
  "Digital Experience Optimization",
  "Customer Journey Design",
  "Enterprise Customer Engagement and Virtual Events",
  "Customer and Learner Acquisition, Retention, and Revenue Growth",
  "Marketing Technology Ecosystems (Salesforce, Marketo, Eloqua, SSO)",
  "Competitive Intelligence and Web Maturity Assessments",
  "Executive Advisory and Stakeholder Management",
  "Strategic Partnerships and Sponsorship Development",
  "Cross-Functional Leadership and Program Delivery",
];

const SUMMARY =
  "Enterprise go-to-market executive with 25+ years leading digital customer engagement, from New York Silicon Alley through enterprise SaaS and executive advisory. Known for helping Fortune 500 organizations turn complex platforms into measurable business outcomes by aligning GTM strategy, customer experience, MarTech, and executive decision-making. Nearly 15 years at ON24 as a trusted advisor to Microsoft, Home Depot, Dell, SAP, IBM, Lenovo, Citibank, and Merck. Founder of GTM Insights Group, advising leadership teams on aligning go-to-market strategy with digital execution.";

export const RESUME_VARIANTS: ResumeVariant[] = [
  {
    id: "impact",
    name: "Executive Impact",
    description: "One-page metrics-forward; core roles only",
    headline:
      "Enterprise Go-to-Market Executive | Customer Engagement | Marketing Technology",
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
        metric: "2x Account",
        label: "Home Depot Path to Pro",
        detail: "$200K to $400K skilled-trades program",
      },
      {
        metric: "$1.8M / yr",
        label: "Global virtual events",
        detail: "50+ events and 500+ webcasts annually",
      },
      {
        metric: "$1.2M+",
        label: "Earlier revenue",
        detail: "RES Media and RESFEST expansion",
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
    headline: "GTM and Digital Engagement Executive",
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
