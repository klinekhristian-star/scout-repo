export type ResumeVariantId = "impact" | "full" | "compact";

export interface ResumeVariant {
  id: ResumeVariantId;
  name: string;
  description: string;
  headline: string;
  summary: string;
  metrics: Array<{ metric: string; label: string; detail: string }>;
  outcomes: string[];
  expertise: string[];
  experienceBlocks: string[];
}

export const RESUME_VARIANTS: ResumeVariant[] = [
  {
    id: "impact",
    name: "Executive Impact",
    description: "One-page metrics-forward executive resume",
    headline:
      "Enterprise Go-to-Market Executive · Customer Engagement · Marketing Technology",
    summary:
      "25+ years leading digital customer engagement and GTM execution—from Silicon Alley through nearly 15 years at ON24 advising Microsoft, Home Depot, Dell, SAP, IBM, Lenovo, Citibank, and Merck, to founding GTM Insights Group. Aligns strategy, experience design, MarTech, and executive decision-making to grow accounts from first engagement to multi-million-dollar programs.",
    metrics: [
      {
        metric: "$2.1M ARR",
        label: "Program growth",
        detail: "Expanded enterprise digital engagement programs",
      },
      {
        metric: "15 yrs",
        label: "Enterprise SaaS",
        detail: "ON24 advisory across global brands",
      },
      {
        metric: "4 regions",
        label: "Global delivery",
        detail: "NA · EMEA · APAC · LATAM programs",
      },
      {
        metric: "25+ yrs",
        label: "Leadership",
        detail: "GTM, CX, and digital engagement",
      },
    ],
    outcomes: [
      "Built multi-year digital engagement programs for Fortune 500 accounts spanning webinars, virtual events, and lifecycle journeys.",
      "Advised executive teams on competitive intelligence and web maturity to close the gap between GTM strategy and digital execution.",
      "Orchestrated MarTech ecosystems (Salesforce, Marketo, Eloqua, SSO) supporting acquisition, retention, and revenue growth.",
      "Founded GTM Insights Group to deliver executive advisory on customer experience optimization and growth analytics.",
    ],
    expertise: [
      "Go-to-Market Strategy & Execution",
      "Digital Experience Optimization",
      "Customer Journey Design",
      "Enterprise Customer Engagement & Virtual Events",
      "Customer & Learner Acquisition, Retention & Revenue Growth",
      "Marketing Technology Ecosystems",
      "Competitive Intelligence & Web Maturity Assessments",
      "Executive Advisory & Stakeholder Management",
      "Strategic Partnerships & Sponsorship Development",
      "Cross-Functional Leadership & Program Delivery",
    ],
    experienceBlocks: [
      "Founder, GTM Insights Group — Executive advisory on GTM strategy, digital CX, competitive intelligence, and growth analytics.",
      "ON24 — Nearly 15 years leading global digital engagement programs for Microsoft, Dell, SAP, IBM, Lenovo, Citibank, Merck, Home Depot, and others across NA, EMEA, APAC, and LATAM.",
      "RES Media Group & Tribeca Enterprises — Brand and sponsorship programs with Apple, Canon, Getty Images, Diesel, Nike, Panasonic, InBev.",
    ],
  },
  {
    id: "full",
    name: "Full Executive",
    description: "Longer chronology for traditional ATS forms",
    headline:
      "VP / Senior Director · Go-to-Market · Digital Customer Engagement",
    summary:
      "Strategic operator and advisor specializing in enterprise go-to-market, digital customer engagement, virtual events, and marketing technology. Track record translating executive vision into cross-functional programs that grow revenue and deepen account relationships.",
    metrics: [
      {
        metric: "Fortune 500",
        label: "Client portfolio",
        detail: "Microsoft, Dell, SAP, IBM, Merck, and more",
      },
      {
        metric: "Global",
        label: "Program scope",
        detail: "Multi-region engagement delivery",
      },
    ],
    outcomes: [
      "Directed enterprise digital engagement strategies tied to pipeline and expansion goals.",
      "Led stakeholder alignment across marketing, sales, CS, and product for complex GTM launches.",
      "Designed measurement frameworks connecting engagement activity to revenue outcomes.",
    ],
    expertise: [
      "GTM Strategy",
      "Customer Engagement",
      "MarTech",
      "Virtual Events",
      "Executive Advisory",
      "Partnerships",
    ],
    experienceBlocks: [
      "GTM Insights Group — Founder & Principal Advisor",
      "ON24 — Senior enterprise engagement leadership",
      "RES Media / Tribeca — Brand & sponsorship programs",
    ],
  },
  {
    id: "compact",
    name: "Compact",
    description: "Tight summary for quick applications",
    headline: "GTM & Digital Engagement Executive",
    summary:
      "Enterprise GTM and digital engagement leader. ON24 alumni; founder of GTM Insights Group. Specializes in virtual events, MarTech, and executive advisory for B2B growth.",
    metrics: [
      {
        metric: "25+ yrs",
        label: "Experience",
        detail: "Enterprise digital engagement",
      },
    ],
    outcomes: [
      "Grew enterprise digital programs into multi-million dollar engagements.",
      "Advises leadership teams on GTM–digital execution alignment.",
    ],
    expertise: [
      "GTM",
      "CX",
      "Virtual Events",
      "MarTech",
      "Executive Advisory",
    ],
    experienceBlocks: [
      "GTM Insights Group — Founder",
      "ON24 — Enterprise engagement leader",
    ],
  },
];

export function getResumeVariant(id: ResumeVariantId): ResumeVariant {
  return RESUME_VARIANTS.find((v) => v.id === id) ?? RESUME_VARIANTS[0]!;
}
