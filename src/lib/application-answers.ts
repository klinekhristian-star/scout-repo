import type { Job, Profile } from "@/data/types";

export type QuestionKind =
  | "why_company"
  | "why_role"
  | "why_you"
  | "strengths"
  | "weakness"
  | "leadership"
  | "challenge"
  | "remote"
  | "salary"
  | "start_date"
  | "relocation"
  | "culture"
  | "generic";

function n(s: string) {
  return s.toLowerCase();
}

export function classifyQuestion(question: string): QuestionKind {
  const q = n(question);
  if (
    /why (do you want to )?(work|join|be).*(here|us|company|this (team|org))/.test(
      q,
    ) ||
    /what (attracts|draws|interests) you about (us|our|this company|the company)/.test(
      q,
    ) ||
    /why .+ company/.test(q)
  )
    return "why_company";
  if (
    /why (this|the) role/.test(q) ||
    /why (are you|do you) (interested|applying)/.test(q) ||
    /what interests you about (this|the) (position|role|opportunity)/.test(q)
  )
    return "why_role";
  if (
    /why (should we|would we) (hire|choose|select) you/.test(q) ||
    /what makes you (a )?(great|good|strong|unique) (fit|candidate)/.test(q) ||
    /why you/.test(q)
  )
    return "why_you";
  if (/strength|what are you good at|greatest strength/.test(q))
    return "strengths";
  if (/weakness|area of improvement|develop/.test(q)) return "weakness";
  if (/lead(ership| a team)|manage(d|ment)|mentor/.test(q)) return "leadership";
  if (
    /challeng|difficult|conflict|obstacle|setback|failure|tell me about a time/.test(
      q,
    )
  )
    return "challenge";
  if (/remote|work from home|hybrid|onsite|in.office/.test(q)) return "remote";
  if (/salary|compensation|pay expectation|expected (pay|comp)/.test(q))
    return "salary";
  if (/start date|when can you start|availability|notice period/.test(q))
    return "start_date";
  if (/relocat|move to|willing to (move|travel)/.test(q)) return "relocation";
  if (/culture|values|team fit|work style/.test(q)) return "culture";
  return "generic";
}

/**
 * Draft a screening-question answer from job + profile context.
 * Template-driven so it works offline and stays on-brand with your career metrics.
 */
export function suggestAnswer(
  question: string,
  job: Job,
  profile: Profile,
): string {
  const kind = classifyQuestion(question);
  const skills =
    (job.skills?.length ? job.skills : profile.skills)
      .slice(0, 4)
      .join(", ") || "go-to-market strategy, digital engagement, and MarTech";
  const company = job.company || "your team";
  const title = job.title || "this role";

  switch (kind) {
    case "why_company":
      return [
        `I'm drawn to ${company} because the ${title} mandate sits at the intersection of go-to-market strategy, customer experience, and measurable revenue outcomes-the same work I've led for 25+ years across enterprise SaaS and advisory.`,
        `What stands out is the chance to partner with a team that treats digital engagement as a growth system, not a set of one-off programs. That is where I do my best work: aligning executives, operators, and MarTech so accounts move from first engagement to multi-year value.`,
      ].join(" ");

    case "why_role":
      return [
        `This ${title} role is a direct match for how I operate: diagnose friction in the buyer or learner journey, design the engagement and MarTech path, and prove value with executive-ready analytics.`,
        `At ON24 I grew strategic accounts (including Microsoft to $2.1M ARR) and directed global virtual event portfolios; as founder of GTM Insights Group I advise leadership teams on the same strategy-to-execution gap this position is built to close.`,
      ].join(" ");

    case "why_you":
      return [
        `You should hire me if you need someone who has already done this work at scale: nearly 15 years at ON24 advising Microsoft, Home Depot, Dell, SAP, IBM, Lenovo, Citibank, and Merck; $2.1M ARR account growth; 50+ global virtual events and 500+ webcasts annually; and MarTech integrations across Salesforce, Marketo, Eloqua, and SSO.`,
        `I bring executive communication, cross-functional delivery, and a bias toward outcomes-pipeline, retention, and revenue-not activity for its own sake.`,
      ].join(" ");

    case "strengths":
      return [
        `My strongest assets are executive stakeholder management, translating complex platforms into clear GTM programs, and growing enterprise accounts from first engagement to multi-million-dollar relationships.`,
        `Practically that shows up as trusted advisory with Fortune 500 teams, rigorous MarTech orchestration (${skills}), and analytics that connect utilization to commercial results.`,
      ].join(" ");

    case "weakness":
      return [
        `I can over-index on depth when a faster, good-enough decision would move the team forward. I've learned to time-box analysis, surface options with clear tradeoffs, and decide with stakeholders instead of polishing past the point of value.`,
        `That discipline is now part of how I run GTM and digital programs-especially under enterprise timelines.`,
      ].join(" ");

    case "leadership":
      return [
        `I led ON24's global virtual events team (team of 5 as Senior Manager) and later operated as Senior Director, Strategic Events-coaching delivery quality while staying the strategic point of contact for top enterprise clients.`,
        `My leadership style is clear goals, high-touch client standards, and standardized processes so quality scales. I partner closely with Product, Engineering, and CS so client needs influence the roadmap and the operating rhythm.`,
      ].join(" ");

    case "challenge":
      return [
        `A representative challenge was growing a strategic enterprise relationship from a single product demo into a multi-year, multi-million-dollar program while coordinating platform, success, and executive stakeholders across regions.`,
        `I aligned on outcomes first, built a reliable engagement cadence, and used utilization and executive analytics to expand scope-resulting in Microsoft reaching $2.1M ARR and similar expansion patterns with accounts like Home Depot Path to Pro ($200K to $400K).`,
      ].join(" ");

    case "remote":
      return profile.openToRemote
        ? `I am fully effective in remote and hybrid models and have delivered global programs across NA, EMEA, APAC, and Latin America. I keep a strong operating cadence with stakeholders asynchronously and on live sessions when decisions need real-time alignment. Open to hybrid or onsite as the role requires.`
        : `I work effectively across remote, hybrid, and onsite models and will align to the team's preferred operating rhythm for ${company}.`;

    case "salary":
      return profile.salaryMin
        ? `For this scope I am targeting total compensation consistent with senior GTM / digital engagement leadership, with base flexibility around a floor near $${profile.salaryMin.toLocaleString()} depending on equity, bonus, and role breadth. Happy to calibrate once we confirm scope and leveling.`
        : `I am flexible on structure (base, bonus, equity) for the right scope and team. Happy to share a calibrated range once we align on responsibilities and leveling for the ${title} role.`;

    case "start_date":
      return `I can move quickly once an offer is finalized. Typical notice is two to four weeks depending on transition commitments; I will give clear dates as soon as we agree on terms.`;

    case "relocation":
      return `I am based in Charleston, SC, open to remote and hybrid, and open to relocation for the right role. Travel for key onsite moments is expected and workable.`;

    case "culture":
      return [
        `I do best in cultures that value clear ownership, executive-ready communication, and evidence over theater-teams that will debate the work, then commit.`,
        `I bring a collaborative style with Product, Sales, CS, and Marketing, and I invest in relationships that make hard cross-functional delivery easier over time.`,
      ].join(" ");

    default:
      return [
        `Drawing on 25+ years in digital customer engagement and GTM-from enterprise SaaS at ON24 through founding GTM Insights Group-I approach this with a focus on measurable outcomes for ${company}.`,
        `Relevant strengths for ${title} include ${skills}, executive stakeholder management, and turning complex platforms into programs that scale. I would welcome the chance to go deeper on how that maps to your priorities.`,
      ].join(" ");
  }
}

export function newScreeningId() {
  return `sq-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
