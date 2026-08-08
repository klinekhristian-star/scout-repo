import type { InterviewStory } from "./types";

const NOW = "2026-08-08T12:00:00.000Z";

/** Seed STAR stories for Khristian Kline GTM / engagement executive search */
export const SEED_STORIES: InterviewStory[] = [
  {
    id: "story-1",
    title: "Fortune 500 digital engagement program growth",
    situation:
      "Enterprise accounts needed multi-year digital engagement programs that connected webinars, virtual events, and lifecycle journeys to pipeline—not one-off webcasts.",
    task: "Lead strategy and executive advisory so programs scaled from first engagement to multi-million-dollar renewals and expansions.",
    action:
      "Aligned GTM, product marketing, CS, and MarTech; designed journey architecture; ran executive web-maturity and competitive sessions with brands including Microsoft, Home Depot, Dell, SAP, IBM, Lenovo, Citibank, and Merck across NA, EMEA, APAC, and LATAM.",
    result:
      "Grew flagship engagement programs into multi-year, multi-million-dollar account relationships with measurable acquisition and expansion impact.",
    tags: ["GTM", "Customer Engagement", "Virtual Events", "Enterprise", "Revenue"],
    brands: ["Microsoft", "Home Depot", "Dell", "SAP", "IBM", "ON24"],
    metrics: "Multi-year enterprise programs · global regions",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "story-2",
    title: "MarTech stack for acquisition and retention",
    situation:
      "Fragmented marketing technology (CRM, MAP, SSO, event platforms) blocked clean handoffs from first touch to expansion.",
    task: "Orchestrate a coherent MarTech ecosystem supporting acquisition, retention, and revenue reporting for enterprise GTM.",
    action:
      "Mapped Salesforce / Marketo / Eloqua / SSO integrations to journey stages; defined ownership across marketing ops and sales; instrumented engagement → pipeline signals leadership could trust.",
    result:
      "Cleaner attribution, faster campaign launch, and executive dashboards that connected digital engagement to revenue outcomes.",
    tags: ["MarTech", "Salesforce", "Marketo", "Eloqua", "Operations"],
    brands: ["ON24", "Salesforce"],
    metrics: "CRM + MAP + SSO orchestration",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "story-3",
    title: "Executive advisory and competitive intelligence",
    situation:
      "Leadership teams struggled to see how digital experience maturity and competitor GTM compared to their own.",
    task: "Deliver executive-ready competitive intelligence and web maturity assessments that drove decisions—not slideware.",
    action:
      "Built assessment frameworks, facilitated C-level workshops, and translated findings into prioritized GTM and experience roadmaps.",
    result:
      "Executives left with ranked gaps, owner maps, and funded next steps—often unlocking larger program scopes.",
    tags: ["Advisory", "Competitive Intelligence", "Executive", "Strategy"],
    brands: ["GTM Insights Group", "ON24"],
    metrics: "C-level workshops · actionable roadmaps",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "story-4",
    title: "Founding GTM Insights Group",
    situation:
      "After nearly 15 years in enterprise SaaS engagement, market demand remained for independent GTM and digital CX counsel.",
    task: "Stand up an advisory practice focused on GTM strategy, customer experience optimization, and growth analytics.",
    action:
      "Defined offer, packaging, and delivery model; brought Fortune-brand pattern library into confidential client work; partnered with operators on execution.",
    result:
      "Independent practice delivering high-trust advisory without product bias—useful proof for principal/advisor and fractional GTM roles.",
    tags: ["Founder", "Advisory", "GTM", "Consulting"],
    brands: ["GTM Insights Group"],
    metrics: "Independent practice launch",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "story-5",
    title: "Sponsorship and brand partnerships at scale",
    situation:
      "Media and cultural brands needed sponsorship programs that created real brand value—not logo walls.",
    task: "Design and sell multi-partner sponsorship and brand programs with global consumer brands.",
    action:
      "At RES Media Group and Tribeca Enterprises, structured packages and narratives for partners including Apple, Canon, Getty, Diesel, Nike, Panasonic, and InBev.",
    result:
      "Closed and delivered high-visibility brand partnerships that taught commercial storytelling still used in enterprise GTM deals.",
    tags: ["Sponsorship", "Partnerships", "Brand", "Commercial"],
    brands: ["Apple", "Nike", "Tribeca", "RES Media"],
    metrics: "Multi-brand sponsorship programs",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "story-6",
    title: "Cross-functional program delivery under executive scrutiny",
    situation:
      "Large virtual event and webinar programs spanned product, marketing, sales, success, and external agencies with fixed launch dates.",
    task: "Drive cross-functional delivery without sacrificing executive narrative quality or data integrity.",
    action:
      "Installed program cadences, RACI, risk logs, and executive readouts; protected content quality while unblocking ops dependencies.",
    result:
      "On-time global programs with clear ownership and fewer last-mile surprises—credibility with both operators and the C-suite.",
    tags: ["Leadership", "Program Delivery", "Cross-Functional", "Events"],
    brands: ["ON24"],
    metrics: "Global launch cadence",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "story-7",
    title: "Turning engagement into pipeline language sales trusts",
    situation:
      "Marketing celebrated attendance metrics; sales cared about opportunities and expansion.",
    task: "Translate digital engagement into pipeline vocabulary and motions sales would actually use.",
    action:
      "Defined MQL/SQL-adjacent engagement signals, account-based webinar plays, and post-event cadences co-owned with sales leadership.",
    result:
      "Higher follow-through on event-sourced pipeline and fewer ‘marketing vanity’ debates in QBRs.",
    tags: ["Pipeline", "Sales Alignment", "ABM", "Revenue", "Events"],
    brands: ["ON24"],
    metrics: "Engagement → pipeline plays",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "story-8",
    title: "Stakeholder management across global regions",
    situation:
      "Regional teams in EMEA/APAC/LATAM needed autonomy while global brand and measurement stayed consistent.",
    task: "Balance global standards with regional go-to-market realities for digital engagement programs.",
    action:
      "Created global playbooks with regional adaptation slots; weekly regional syncs; shared scorecards without one-size-fits-all content.",
    result:
      "Regions shipped local campaigns faster while roll-ups remained executive-readable.",
    tags: ["Global", "Stakeholder Management", "Leadership", "GTM"],
    brands: ["ON24"],
    metrics: "NA · EMEA · APAC · LATAM",
    createdAt: NOW,
    updatedAt: NOW,
  },
];
