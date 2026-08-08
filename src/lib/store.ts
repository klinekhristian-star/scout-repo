import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEED_JOBS, mergeJobCatalog } from "@/data/jobs";
import type {
  ActivityEvent,
  Application,
  ApplicationStage,
  BoardSyncStatus,
  InterviewStory,
  Job,
  JobBoardSettings,
  OutreachEntry,
  Profile,
  SearchAgent,
  WorkMode,
  Seniority,
} from "@/data/types";
import { SEED_STORIES } from "@/data/story-bank";
import { defaultAtsTargets } from "@/lib/job-boards/ats";
import { TOGGLE_BOARD_IDS, type ToggleBoardId } from "@/lib/job-boards/meta";
import { generateCoverLetter, jobMatchesAgent, scoreJob } from "@/lib/matching";
import { syncJobBoards } from "@/server/job-boards";

/** Profile seeded from Khristian Kline executive resume (GTM / MarTech / CX). */
const defaultProfile: Profile = {
  name: "Khristian Kline",
  email: "klinekhristian@gmail.com",
  headline:
    "Enterprise Go-to-Market Executive · Customer Engagement · Marketing Technology",
  location: "Charleston, SC",
  openToRemote: true,
  openToHybrid: true,
  openToOnsite: true,
  targetTitles: [
    "VP Go-to-Market",
    "VP Customer Engagement",
    "Senior Director Digital Engagement",
    "Head of Marketing Technology",
    "VP Customer Success",
    "Executive Advisor GTM",
    "Director Virtual Events",
    "Principal GTM Strategy",
    "VP Revenue Marketing",
    "Managing Director Digital Transformation",
  ],
  skills: [
    "Go-to-Market Strategy",
    "Digital Experience Optimization",
    "Customer Journey Design",
    "Enterprise Customer Engagement",
    "Virtual Events",
    "Webinars",
    "Customer Acquisition",
    "Learner Acquisition",
    "Retention Strategy",
    "Revenue Growth",
    "Marketing Technology",
    "Salesforce",
    "Marketo",
    "Eloqua",
    "SSO",
    "Competitive Intelligence",
    "Web Maturity Assessments",
    "Executive Advisory",
    "Stakeholder Management",
    "Strategic Partnerships",
    "Sponsorship Development",
    "Cross-Functional Leadership",
    "Program Delivery",
    "Executive Analytics",
    "Enterprise SaaS",
  ],
  yearsExperience: 25,
  salaryMin: 180000,
  preferredLocations: [
    "Remote",
    "Charleston",
    "South Carolina",
    "Charlotte",
    "Atlanta",
    "Southeast",
    "New York",
  ],
  resumeSummary:
    "Enterprise go-to-market executive with 25+ years leading digital customer engagement—from Silicon Alley through enterprise SaaS (nearly 15 years at ON24 advising Microsoft, Home Depot, Dell, SAP, IBM, Lenovo, Citibank, Merck) to founding GTM Insights Group. Known for aligning GTM strategy, customer experience, marketing technology, and executive decision-making to grow accounts from initial engagement to multi-million-dollar programs. Open to relocation and remote.",
  autoSaveMatchesAbove: 75,
  notifyOnNewMatches: true,
};

export const defaultBoardSettings: JobBoardSettings = {
  remotive: true,
  arbeitnow: true,
  remoteok: true,
  jobicy: true,
  himalayas: true,
  themuse: true,
  weworkremotely: true,
  adzuna: false,
  adzunaAppId: "",
  adzunaAppKey: "",
  adzunaCountry: "us",
  includeSeedJobs: false,
  defaultQuery: "go-to-market customer engagement marketing technology",
  atsEnabled: true,
  atsTargets: defaultAtsTargets(),
};
