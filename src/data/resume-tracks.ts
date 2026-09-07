import type { SearchAgent, Seniority, WorkMode } from "@/data/types";

/**
 * Search tracks aligned to the six live resume variants.
 * Board sync + agents use these titles / queries — not generic GTM exec titles.
 */
export const RESUME_TRACKS = [
  {
    id: "account-events",
    resume: "Columbia Account / Events",
    headline: "Account Manager | Digital Events Producer",
    titles: [
      "Account Manager",
      "Digital Events Producer",
      "Client Services Manager",
      "Customer Success Manager",
      "Events Manager",
      "Account Executive Events",
    ],
    query:
      '"account manager" OR "digital events producer" OR "client services" OR CSM OR "events manager" OR "event producer"',
    skills: [
      "Named-account growth",
      "Event production",
      "Run-of-show",
      "Sponsorship sales",
      "Salesforce",
      "Webcasts",
    ],
  },
  {
    id: "customer-success",
    resume: "Customer Success",
    headline: "Director of Customer Success | Enterprise Account Growth",
    titles: [
      "Director of Customer Success",
      "Customer Success Manager",
      "Enterprise Customer Success",
      "Head of Customer Success",
      "CSM",
      "Named Account Manager",
    ],
    query:
      '"customer success" OR "director of customer success" OR CSM OR "account growth" OR "named account" OR retention expansion',
    skills: [
      "Adoption",
      "Retention",
      "Expansion",
      "Executive QBRs",
      "Named-account health",
      "Salesforce",
    ],
  },
  {
    id: "digital-events",
    resume: "Digital Events",
    headline: "Director of Digital Events | Virtual Events Producer",
    titles: [
      "Director of Digital Events",
      "Virtual Events Producer",
      "Events Producer",
      "Webcast Producer",
      "Hybrid Events Manager",
      "Event Program Manager",
    ],
    query:
      '"digital events" OR "virtual events" OR "event producer" OR webcast OR "hybrid events" OR "event programming"',
    skills: [
      "ON24",
      "Run-of-show",
      "Webcast production",
      "Rehearsals",
      "Vendor coordination",
      "Live issue resolution",
    ],
  },
  {
    id: "master-engagement",
    resume: "Master / Strategic Events",
    headline: "Enterprise Digital Engagement & Strategic Events Executive",
    titles: [
      "Director of Strategic Events",
      "Head of Digital Engagement",
      "Director Digital Engagement",
      "Strategic Events Manager",
      "Enterprise Events Director",
    ],
    query:
      '"strategic events" OR "digital engagement" OR "virtual events director" OR "enterprise events" OR "customer engagement"',
    skills: [
      "Strategic events",
      "Digital engagement",
      "Named-account growth",
      "Virtual hybrid production",
      "MarTech",
    ],
  },
  {
    id: "program-manager",
    resume: "Program Manager",
    headline: "Program Manager | GTM & Digital Delivery",
    titles: [
      "Program Manager",
      "Technical Program Manager",
      "Digital Program Manager",
      "GTM Program Manager",
      "Implementation Manager",
      "Delivery Manager",
    ],
    query:
      '"program manager" OR "technical program manager" OR "digital delivery" OR "implementation manager" OR "project manager" events GTM',
    skills: [
      "Program delivery",
      "Stakeholder management",
      "MarTech implementation",
      "Risk reporting",
      "Vendor governance",
    ],
  },
  {
    id: "sales-account",
    resume: "Sales / Account Growth",
    headline: "Enterprise Account Director | B2B SaaS Account Growth",
    titles: [
      "Enterprise Account Director",
      "Account Director",
      "Account Manager SaaS",
      "Customer Account Manager",
      "Renewals Manager",
      "Expansion Manager",
    ],
    query:
      '"account director" OR "enterprise account" OR "account manager" SaaS OR renewals OR "named account" OR "customer growth"',
    skills: [
      "Named-account growth",
      "Renewals",
      "Sales partnership",
      "Executive relationships",
      "Salesforce",
    ],
  },
] as const;

export const ALL_TRACK_TITLES: string[] = [
  ...new Set(RESUME_TRACKS.flatMap((t) => [...t.titles])),
];

export const DEFAULT_BOARD_QUERY =
  "account manager OR customer success OR digital events OR virtual events producer OR program manager OR account director OR strategic events";

export function defaultSearchAgents(): SearchAgent[] {
  const now = new Date().toISOString();
  const workModes: WorkMode[] = ["remote", "hybrid"];
  const seniorities: Seniority[] = ["mid", "senior", "staff", "lead", "director"];
  return RESUME_TRACKS.map((t) => ({
    id: `agent-track-${t.id}`,
    name: t.resume,
    query: t.query,
    locations: ["United States", "Remote", "Columbia", "South Carolina", "Charlotte"],
    workModes,
    seniorities,
    skills: [...t.skills],
    sources: [],
    frequency: "daily" as const,
    enabled: true,
    minMatchScore: 55,
    autoSave: false,
    createdAt: now,
    lastMatchCount: 0,
    totalMatches: 0,
  }));
}
