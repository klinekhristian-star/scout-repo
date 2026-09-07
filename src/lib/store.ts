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
import { defaultAtsTargets } from "@/lib/job-boards/ats";
import { TOGGLE_BOARD_IDS, type ToggleBoardId } from "@/lib/job-boards/meta";
import { generateCoverLetter, jobMatchesAgent, scoreJob } from "@/lib/matching";
import {
  ALL_TRACK_TITLES,
  DEFAULT_BOARD_QUERY,
  defaultSearchAgents,
} from "@/data/resume-tracks";
import { syncJobBoards } from "@/server/job-boards";

/** Profile — real user defaults, not demo content. */
const defaultProfile: Profile = {
  name: "Khristian Kline",
  email: "klinekhristian@gmail.com",
  headline:
    "Account Manager | Digital Events | Customer Success | Program Delivery",
  location: "Columbia, SC",
  openToRemote: true,
  openToHybrid: true,
  openToOnsite: true,
  targetTitles: ALL_TRACK_TITLES,
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
    "Columbia",
    "South Carolina",
    "Charleston",
    "Charlotte",
    "Atlanta",
    "Southeast",
    "United States",
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
  defaultQuery: DEFAULT_BOARD_QUERY,
  atsEnabled: false,
  atsTargets: defaultAtsTargets(),
};
