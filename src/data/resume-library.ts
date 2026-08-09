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

/** Canonical career history — source of truth for all tailored resumes */
export const CAREER_ROLES: Experience[] = [
  {
    id: "gtm-insights",
    company: "GTM Insights Group",
    title: "Founder & Principal",
    location: "",
    start: "June 2026",
    end: "Present",
    bullets: [
      "Founded an executive advisory practice helping enterprise organizations improve revenue and audience growth by connecting go-to-market strategy with digital execution.",
      "Partner with executive teams to identify friction in the buyer or learner journey and transform digital experiences, analytics, and engagement strategy into measurable gains in acquisition, retention, and revenue.",
      "Leading go-to-market strategy, learner acquisition, and digital presence for a Skilled Trades School's Driller Academy, backed by a $116,000 Wisconsin Fast Forward Workforce Grant.",
      "Developing frameworks for GTM maturity assessments, competitive intelligence, digital experience optimization, and acquisition/retention analytics.",
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
      "Grew the Microsoft account from an initial product demo to $2.1M in annual revenue over seven years across webcasting and virtual environments; instrumental in migrating Microsoft to ON24's GoLive platform.",
      "Designed and managed Home Depot's Path to Pro program—a free skilled trades training initiative including a companion site for youth ages 14–18; grew the account from ~$200K to $400K by expanding the youth program and driving greater utilization.",
      "Directed 50+ global virtual events and 500+ enterprise webcasts annually, representing $1.8M in annual revenue, across North America, EMEA, APAC, and Latin America.",
      "Led integrations with Salesforce, Marketo, Eloqua, and Microsoft Dynamics; coordinated SAML/SSO implementation for enterprise clients.",
      "Built trusted executive relationships with Dell, SAP, IBM, Lenovo, Citibank, and Merck; guided clients on digital engagement strategy, webinar optimization, and audience engagement.",
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
      "Progressed from Virtual Event Manager to Senior Manager, Virtual Events (led a team of 5), then Senior Manager, VS Operations.",
      "Served as strategic point of contact for top-tier enterprise clients, bridging client goals with platform capabilities and ensuring high-touch delivery for complex global engagements.",
      "Standardized event execution processes across the team to support scaling demand.",
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
      "Led delivery and client strategy for interactive digital experiences, managing cross-functional teams of producers, designers, and developers alongside a Webby Award–winning team.",
      "Primary client lead for cultural and institutional clients including the Mint Museum, WDAV Classical Radio, and Reynolda House Museum of American Art.",
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
      "Founded digital consultancy focused on interactive technology, strategic partnerships, and customer experience.",
      "Directed digital transformation for RoundPoint Financial; secured multi-year Hard Rock Cafe sponsorship for Little Steven's Underground Garage.",
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
      "Key role launching Tomorrow Unlimited for the Tribeca Film Festival; digital strategy and sponsorship with Apple, Canon, Getty Images, Diesel, and others.",
      "Generated $1.2M+ annual revenue and expanded RESFEST into 40+ international cities; founded RES LAB integrated marketing division.",
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
  "Enterprise go-to-market executive with more than 25 years leading digital customer engagement and GTM strategy—from New York's Silicon Alley through enterprise SaaS and now executive advisory. Known for helping Fortune 500 organizations transform complex technology into measurable business outcomes by aligning GTM strategy, customer experience, marketing technology, and executive decision-making, with a track record of growing enterprise accounts from initial engagement to multi-million-dollar programs. During nearly 15 years at ON24, served as a trusted strategic advisor to Microsoft, Home Depot, Dell, SAP, IBM, Lenovo, Citibank, and Merck. Today, as Founder of GTM Insights Group, advises executive teams on closing the gap between go-to-market strategy and digital execution.";

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
        detail: "Grew ON24 Microsoft relationship over seven years",
      },
      {
        metric: "2× Account",
        label: "Home Depot Path to Pro",
        detail: "Grew ~$200K → $400K skilled-trades program",
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
