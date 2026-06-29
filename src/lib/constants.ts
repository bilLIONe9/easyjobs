import {
  LayoutDashboard,
  Wrench,
  Newspaper,
  FolderKanban,
  IdCard,
} from "lucide-react";

export const APP_CONSTANTS = {
  RECORDS_PER_PAGE: 25,
  RECORDS_PER_PAGE_OPTIONS: [25, 50, 100],
  ACTIVITY_MAX_DURATION_MINUTES: 8 * 60, // 8 Hours
  ACTIVITY_MAX_DURATION_MS: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
  RECENT_NUM_JOBS_ACTIVITIES: 7,
  AI_SLOW_RESPONSE_THRESHOLD_MS: 15_000, // 15 seconds
} as const;

export const JOB_SOURCES = [
  { label: "Indeed", value: "indeed" },
  { label: "Linkedin", value: "linkedin" },
  { label: "Monster", value: "monster" },
  { label: "Glassdoor", value: "glassdoor" },
  { label: "Company Career page", value: "careerpage" },
  { label: "Google", value: "google" },
  { label: "ZipRecruiter", value: "ziprecruiter" },
  { label: "Job Street", value: "jobstreet" },
  { label: "Other", value: "other" },
] as const;

export const JOB_STATUSES = [
  { label: "Draft", value: "draft" },
  { label: "Applied", value: "applied" },
  { label: "Interview", value: "interview" },
  { label: "Offer", value: "offer" },
  { label: "Rejected", value: "rejected" },
  { label: "Expired", value: "expired" },
  { label: "Archived", value: "archived" },
] as const;

export const SIDEBAR_LINKS = [
  {
    icon: LayoutDashboard,
    route: "/dashboard",
    label: "Dashboard",
  },
  {
    icon: Newspaper,
    route: "/dashboard/job-posts",
    label: "Job Posts",
  },
  {
    icon: FolderKanban,
    route: "/dashboard/applications",
    label: "Applications",
  },
  {
    icon: IdCard,
    route: "/dashboard/job-profiles",
    label: "Job Profiles",
  },
  {
    icon: Wrench,
    route: "/dashboard/developer",
    label: "Developer Options",
    devOnly: true,
  },
];
