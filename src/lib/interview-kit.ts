import type {
  InterviewKit,
  InterviewStory,
  Job,
  Profile,
} from "@/data/types";

function normalize(s: string) {
  return s.toLowerCase().replace(/[^\w+#./\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function scoreStory(story: InterviewStory, job: Job, profile: Profile): number {
  const hay = normalize(
    `${job.title} ${job.company} ${job.description} ${job.skills.join(" ")} ${job.requirements.join(" ")} ${profile.skills.join(" ")}`,
  );
  let score = 0;
  for (const t of story.tags) {
    if (hay.includes(normalize(t))) score += 3;
  }
  for (const b of story.brands ?? []) {
    if (hay.includes(normalize(b))) score += 2;
  }
  const blob = normalize(
    `${story.title} ${story.situation} ${story.action} ${story.result}`,
  );
  for (const token of hay.split(" ").filter((w) => w.length > 5).slice(0, 40)) {
    if (blob.includes(token)) score += 1;
  }
  return score;
}

export function buildInterviewKit(
  job: Job,
  profile: Profile,
  stories: InterviewStory[],
): InterviewKit {
  const mapped = [...stories]
    .map((s) => ({
      storyId: s.id,
      title: s.title,
      score: scoreStory(s, job, profile),
      why: s.tags.slice(0, 3).join(" · ") || "Leadership proof point",
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ storyId, title, why, score }) => ({ storyId, title, why, score }));

  const skills = job.skills.slice(0, 4).join(", ") || "enterprise GTM";
  const title = job.title;

  const likelyQuestions = [
    `Walk us through how you would approach the ${title} mandate in your first 90 days at ${job.company}.`,
    `Tell us about a time you turned digital engagement into measurable pipeline or expansion revenue.`,
    `How do you align marketing, sales, and customer success on a single customer journey?`,
    `Which MarTech decisions matter most for ${skills}? What would you audit first here?`,
    `Describe a failed program or initiative—what did you change afterward?`,
    `How do you advise executives who want more webinars without a clear GTM thesis?`,
    `How have you built or influenced global programs across regions with different maturity?`,
    `Why ${job.company}, and why this role versus continuing pure advisory work?`,
  ];

  const talkingPoints = [
    `Position as enterprise GTM + digital customer engagement operator-advisor (${profile.yearsExperience}+ years).`,
    `Lead with ON24-scale brand proof (Microsoft, Home Depot, Dell, SAP, IBM…) then GTM Insights independence.`,
    `Connect every story to ${job.company}'s likely outcomes: pipeline, retention, executive clarity.`,
    `Name MarTech fluency (Salesforce, Marketo/Eloqua, SSO) as enablement—not tool worship.`,
    `Close with how you'd run discovery in week 1: journey map, stack audit, revenue handoff gaps.`,
  ];

  const questionsToAsk = [
    `How does success for this ${title} role get measured in the first two quarters?`,
    `Where does digital engagement ownership sit today relative to product marketing, CS, and sales?`,
    `What is the current MarTech stack, and what is broken in the handoff to revenue?`,
    `Which executive stakeholders most influence prioritization of GTM programs?`,
    `What has been tried already that did not stick—and why?`,
  ];

  const openers = [
    `I've spent 25+ years connecting GTM strategy to digital engagement programs that enterprises renew—happy to go deep on how that maps to ${job.company}.`,
    `My bias is outcomes over activity: virtual events and journeys only matter if sales and CS can run the next play.`,
  ];

  return {
    likelyQuestions,
    mappedStories: mapped,
    talkingPoints,
    questionsToAsk,
    openers,
  };
}

export function storyPlainText(story: InterviewStory): string {
  return [
    story.title,
    "",
    `S — ${story.situation}`,
    `T — ${story.task}`,
    `A — ${story.action}`,
    `R — ${story.result}`,
    story.metrics ? `Metrics: ${story.metrics}` : "",
    story.tags.length ? `Tags: ${story.tags.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
