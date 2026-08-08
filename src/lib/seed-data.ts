import type { Job, MasterResume } from "./types";

export const defaultResume: MasterResume = {
  fullName: "Alex Morgan",
  headline: "Senior Product Engineer · Full-stack",
  email: "alex.morgan@email.com",
  phone: "(704) 555-0142",
  location: "Charlotte, NC · Remote OK",
  links: ["linkedin.com/in/alexmorgan", "github.com/alexmorgan", "alexmorgan.dev"],
  summary:
    "Product-minded engineer with 8+ years shipping customer-facing web platforms. Strengths in React, TypeScript, Node, and designing systems that balance speed, reliability, and polished UX. Led cross-functional teams from discovery through launch at high-growth SaaS companies.",
  skills: [
    "TypeScript",
    "React",
    "Node.js",
    "Next.js",
    "PostgreSQL",
    "System Design",
    "Product Discovery",
    "A/B Testing",
    "GraphQL",
    "AWS",
    "CI/CD",
    "Agile Leadership",
    "Tailwind CSS",
    "REST APIs",
    "Performance Optimization",
  ],
  experience: [
    {
      id: "exp1",
      company: "Northline Analytics",
      title: "Senior Product Engineer",
      location: "Remote",
      start: "2022",
      end: "Present",
      bullets: [
        "Owned end-to-end delivery of a multi-tenant React + TypeScript dashboard used by 40k monthly active users.",
        "Cut p95 API latency 38% by redesigning PostgreSQL queries and introducing a read-model cache layer.",
        "Partnered with design and PM to ship experiment framework; improved activation +12% across three releases.",
        "Mentored 4 engineers and established code-review + CI standards that reduced production incidents 25%.",
      ],
    },
    {
      id: "exp2",
      company: "Harbor Commerce",
      title: "Full-Stack Engineer",
      location: "Charlotte, NC",
      start: "2019",
      end: "2022",
      bullets: [
        "Built Node.js order orchestration services handling 2M+ events/day with idempotent processing.",
        "Migrated legacy storefront checkout to React SPA, improving conversion 9% and Lighthouse score to 94.",
        "Designed GraphQL gateway unifying catalog, inventory, and pricing for mobile and web clients.",
        "Led on-call rotations and wrote runbooks that shortened mean-time-to-recovery from 45m to 18m.",
      ],
    },
    {
      id: "exp3",
      company: "Brightfield Labs",
      title: "Software Engineer",
      location: "Raleigh, NC",
      start: "2016",
      end: "2019",
      bullets: [
        "Shipped internal tooling in React/Node that automated QA workflows for a 30-person product org.",
        "Implemented AWS-backed file pipeline for large media uploads with resumable transfers.",
        "Collaborated with data science on feature flags and metrics instrumentation for growth experiments.",
      ],
    },
  ],
  education: [
    {
      id: "edu1",
      school: "University of North Carolina at Charlotte",
      degree: "B.S. Computer Science",
      year: "2016",
    },
  ],
};

export const seedJobs: Job[] = [
  {
    id: "job_stripe_pm_eng",
    title: "Senior Software Engineer, Product",
    company: "Stripe",
    location: "Remote · US",
    salary: "$180k–$240k + equity",
    status: "saved",
    postedAt: "2026-08-04",
    url: "https://stripe.com/jobs",
    description: `About the role
Stripe is looking for a Senior Software Engineer, Product to build delightful merchant-facing experiences across our dashboard and onboarding flows.

What you'll do
- Design and ship full-stack product features with React, TypeScript, and Node services
- Partner with Product and Design on discovery, prototyping, and iterative delivery
- Improve reliability and performance of high-traffic customer journeys
- Write clean APIs and data models backed by PostgreSQL
- Mentor engineers and raise the bar for code quality and system design

Requirements
- 6+ years building production web applications
- Strong TypeScript and React skills; experience with modern frontend architecture
- Backend experience with Node.js, REST or GraphQL APIs
- Comfort with A/B testing, metrics, and product experimentation
- Excellent communication and cross-functional collaboration

Nice to have
- Payments or fintech domain experience
- AWS, CI/CD, and observability tooling
- Experience leading technical design reviews`,
  },
  {
    id: "job_vercel_fe",
    title: "Staff Frontend Engineer",
    company: "Vercel",
    location: "Remote · Americas",
    salary: "$200k–$280k",
    status: "applied",
    postedAt: "2026-08-01",
    description: `We're hiring a Staff Frontend Engineer to own developer-facing product surfaces.

Responsibilities
- Architect complex React + TypeScript UIs with outstanding performance
- Drive design systems, accessibility, and polish across the product
- Collaborate with DX, design, and platform teams
- Improve Core Web Vitals and client-side reliability

Must-haves
- Deep expertise in React, TypeScript, and modern CSS (Tailwind preferred)
- Track record shipping high-quality frontend systems at scale
- Experience mentoring and setting technical direction
- Strong product sense and attention to detail

Bonus
- Next.js, edge runtimes, SSR/SSG expertise
- Open-source contributions
- Experience with design tooling workflows`,
  },
  {
    id: "job_notion_fs",
    title: "Full Stack Engineer",
    company: "Notion",
    location: "San Francisco / Remote",
    salary: "$160k–$220k",
    status: "interview",
    postedAt: "2026-07-28",
    description: `Join Notion's product engineering team building collaborative workspaces used by millions.

You will
- Ship features across React clients and Node/PostgreSQL services
- Own product areas from technical design to launch
- Work closely with design on interaction quality
- Improve system design for real-time collaboration

Qualifications
- Experience with TypeScript, React, and backend services
- Comfort with ambiguous product problems
- Strong written communication
- Prior work on multi-tenant SaaS a plus`,
  },
  {
    id: "job_local_startup",
    title: "Lead Engineer",
    company: "Scout Labs",
    location: "Charlotte, NC (Hybrid)",
    salary: "$145k–$175k + equity",
    status: "saved",
    postedAt: "2026-08-06",
    description: `Scout Labs is building the next-gen job search OS for ambitious operators.

Role
- Lead engineering for our ATS-aware resume and application tracker
- Build product-facing React apps and Node APIs
- Establish architecture, testing, and deployment practices
- Work directly with founders on roadmap and customer feedback

Need
- Full-stack TypeScript experience (React + Node)
- Product ownership mindset
- Experience with PDF generation, document pipelines, or search is a plus
- Based in or willing to be near Charlotte part-time`,
  },
];
