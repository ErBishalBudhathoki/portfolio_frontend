import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  BrainCircuit,
  Code2,
  Cpu,
  Database,
  Globe,
  Github,
  Layers3,
  Rocket,
  Server,
  Smartphone,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type Skill = {
  name?: string;
  category?: string;
  endorsements?: number | string;
  icon?: string;
  category_order?: number | string;
  skill_order?: number | string;
  display_category?: string;
};

type SkillsObject = {
  technical?: string[];
  soft?: string[];
};

type ExperienceItem = {
  title?: string;
  role?: string;
  company?: string;
  date_range?: string;
};

type ProjectItem = {
  name?: string;
  title?: string;
  description?: string;
  url?: string;
  link?: string;
};

type ProfileData = {
  basic_info?: {
    name?: string;
    headline?: string;
    location?: string;
  };
  skills?: Skill[] | string[] | SkillsObject;
  experience?: ExperienceItem[];
  projects?: ProjectItem[];
};

type GitHubActivityDay = {
  date: string;
  count: number;
  level: number;
  color?: string | null;
  is_placeholder: boolean;
  weekday: number;
};

type GitHubActivityWeek = {
  first_day: string;
  days: GitHubActivityDay[];
};

type GitHubActivityYear = {
  year: number;
  range_start: string;
  range_end: string;
  total_contributions: number;
  active_days: number;
  max_contribution_count: number;
  busiest_day?: {
    date: string;
    count: number;
  } | null;
  month_labels: Array<{
    week_index: number;
    label: string;
  }>;
  weeks: GitHubActivityWeek[];
};

type GitHubActivity = {
  username: string;
  profile_url: string;
  available: boolean;
  source?: string;
  message?: string;
  recent_repositories?: Array<{
    name?: string;
    name_with_owner?: string;
    url?: string;
    last_commit_at?: string;
    commit_count?: number;
  }>;
  years: GitHubActivityYear[];
};

type NormalizedSkill = {
  name: string;
  category: string;
  endorsements: number;
  icon?: string;
  categoryOrder: number;
  skillOrder: number;
  displayCategory?: string;
};

const fallbackSkillIcons: Record<string, string> = {
  JavaScript: "js",
  TypeScript: "ts",
  Python: "py",
  Java: "java",
  Kotlin: "kotlin",
  Flutter: "flutter",
  Android: "androidstudio",
  "Android Studio": "androidstudio",
  React: "react",
  "React.js": "react",
  "Next.js": "nextjs",
  HTML: "html",
  CSS: "css",
  "Tailwind CSS": "tailwind",
  "Node.js": "nodejs",
  Express: "express",
  FastAPI: "fastapi",
  Firebase: "firebase",
  MongoDB: "mongodb",
  PostgreSQL: "postgres",
  MySQL: "mysql",
  AWS: "aws",
  "Google Cloud": "gcp",
  Docker: "docker",
  Git: "git",
  Github: "github",
  "Machine Learning": "pytorch",
  "Artificial Intelligence": "ai",
  TensorFlow: "tensorflow",
  PyTorch: "pytorch",
  "VS Code": "vscode",
  "Visual Studio": "visualstudio",
  PyCharm: "pycharm",
  "IntelliJ IDEA": "idea",
};

const defaultCategoryOrder: Record<string, number> = {
  Frontend: 1,
  "Frontend Development": 1,
  Mobile: 2,
  "Mobile Development": 2,
  Backend: 3,
  "Backend Development": 3,
  Database: 4,
  "Cloud Platform": 5,
  "DevOps Tool": 5,
  "DevOps/Cloud": 5,
  "AI/ML": 6,
  "Artificial Intelligence": 6,
  "Machine Learning": 6,
  "Programming Language": 7,
  "Soft Skill": 8,
  Other: 99,
};

function parseNumber(value: number | string | undefined, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function inferSkillCategory(name: string): string {
  const value = name.toLowerCase();

  if (/flutter|android|kotlin|mobile/.test(value)) return "Mobile Development";
  if (/react|vue|angular|javascript|typescript|html|css|tailwind|bootstrap|dom|frontend|ui/.test(value)) {
    return "Frontend Development";
  }
  if (/node|express|django|flask|fastapi|python|java|backend|server|rest|api|auth/.test(value)) {
    return "Backend Development";
  }
  if (/sql|mysql|postgres|mongodb|firebase|redis|database/.test(value)) {
    return "Database";
  }
  if (/aws|gcp|google cloud|docker|kubernetes|devops|git|cloud/.test(value)) {
    return "DevOps/Cloud";
  }
  if (/tensorflow|pytorch|machine learning|artificial intelligence| ai|ml|gpt/.test(value)) {
    return "AI/ML";
  }

  return "Other";
}

function normalizeSkills(skills: ProfileData["skills"]): NormalizedSkill[] {
  if (!skills) {
    return [];
  }

  const seen = new Map<string, NormalizedSkill>();

  const upsert = (input: Partial<NormalizedSkill> & { name: string }) => {
    const name = input.name.trim();
    if (!name) return;

    const category = (input.category || "").trim() || inferSkillCategory(name);
    const normalized: NormalizedSkill = {
      name,
      category,
      endorsements: parseNumber(input.endorsements, 0),
      icon: input.icon?.trim() || fallbackSkillIcons[name] || undefined,
      categoryOrder: parseNumber(input.categoryOrder, defaultCategoryOrder[category] ?? 50),
      skillOrder: parseNumber(input.skillOrder, Number.MAX_SAFE_INTEGER),
      displayCategory: input.displayCategory?.trim() || undefined,
    };

    const key = `${normalized.category}::${normalized.name}`.toLowerCase();
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, normalized);
      return;
    }

    if (normalized.skillOrder < existing.skillOrder || normalized.endorsements > existing.endorsements) {
      seen.set(key, normalized);
    }
  };

  if (Array.isArray(skills)) {
    skills.forEach((skill) => {
      if (typeof skill === "string") {
        upsert({ name: skill });
        return;
      }

      upsert({
        name: skill.name || "",
        category: skill.category,
        endorsements: skill.endorsements,
        icon: skill.icon,
        categoryOrder: skill.category_order,
        skillOrder: skill.skill_order,
        displayCategory: skill.display_category,
      });
    });
  } else {
    (skills.technical || []).forEach((name) => upsert({ name, category: inferSkillCategory(name) }));
    (skills.soft || []).forEach((name) => upsert({ name, category: "Other" }));
  }

  return Array.from(seen.values()).sort((a, b) => {
    if (a.categoryOrder !== b.categoryOrder) return a.categoryOrder - b.categoryOrder;
    if (a.skillOrder !== b.skillOrder) return a.skillOrder - b.skillOrder;
    if (b.endorsements !== a.endorsements) return b.endorsements - a.endorsements;
    return a.name.localeCompare(b.name);
  });
}

function groupSkills(skills: NormalizedSkill[]) {
  const groups = new Map<
    string,
    { label: string; categoryOrder: number; skills: NormalizedSkill[] }
  >();

  skills.forEach((skill) => {
    const key = skill.category;
    if (!groups.has(key)) {
      groups.set(key, {
        label: skill.displayCategory || skill.category,
        categoryOrder: skill.categoryOrder,
        skills: [],
      });
    }

    groups.get(key)!.skills.push(skill);
  });

  return Array.from(groups.entries())
    .map(([key, value]) => ({ key, ...value }))
    .sort((a, b) => {
      if (a.categoryOrder !== b.categoryOrder) return a.categoryOrder - b.categoryOrder;
      return a.label.localeCompare(b.label);
    });
}

function getCategoryVisual(category: string) {
  const key = category.toLowerCase();

  if (key.includes("mobile")) {
    return {
      icon: Smartphone,
      accent: "from-primary/18 via-primary/8 to-transparent",
      chip: "border-primary/20 bg-primary/10 text-primary",
    };
  }

  if (key.includes("front")) {
    return {
      icon: Layers3,
      accent: "from-sky-500/18 via-sky-500/8 to-transparent",
      chip: "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-300",
    };
  }

  if (key.includes("back")) {
    return {
      icon: Server,
      accent: "from-violet-500/18 via-violet-500/8 to-transparent",
      chip: "border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-300",
    };
  }

  if (key.includes("data") || key.includes("database")) {
    return {
      icon: Database,
      accent: "from-pink-500/18 via-pink-500/8 to-transparent",
      chip: "border-pink-500/20 bg-pink-500/10 text-pink-600 dark:text-pink-300",
    };
  }

  if (key.includes("cloud") || key.includes("devops")) {
    return {
      icon: Workflow,
      accent: "from-emerald-500/18 via-emerald-500/8 to-transparent",
      chip: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    };
  }

  if (key.includes("ai") || key.includes("machine")) {
    return {
      icon: BrainCircuit,
      accent: "from-amber-500/18 via-amber-500/8 to-transparent",
      chip: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    };
  }

  if (key.includes("program")) {
    return {
      icon: Cpu,
      accent: "from-cyan-500/18 via-cyan-500/8 to-transparent",
      chip: "border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
    };
  }

  return {
    icon: Globe,
    accent: "from-accent-foreground/16 via-accent-foreground/8 to-transparent",
    chip: "border-accent-foreground/20 bg-accent/70 text-accent-foreground",
  };
}

function getCategoryDescription(category: string) {
  const key = category.toLowerCase();

  if (key.includes("mobile")) {
    return "Product-minded app development across native Android and cross-platform delivery.";
  }

  if (key.includes("front")) {
    return "Interface work focused on usable components, responsive layouts, and polished implementation.";
  }

  if (key.includes("back")) {
    return "Application logic, APIs, authentication, and service-side delivery for production features.";
  }

  if (key.includes("data") || key.includes("database")) {
    return "Data storage, querying, and backend persistence patterns that support real products.";
  }

  if (key.includes("cloud") || key.includes("devops")) {
    return "Deployment, tooling, and cloud operations that help products ship and stay maintainable.";
  }

  if (key.includes("ai") || key.includes("machine")) {
    return "Applied AI and ML work used where it adds product value rather than noise.";
  }

  if (key.includes("program")) {
    return "Core languages that support both application development and problem solving across the stack.";
  }

  return "Supporting strengths that broaden implementation range and day-to-day effectiveness.";
}

function formatCompany(company?: string) {
  return (company || "").replace(/\s+/g, " ").trim();
}

function getContributionTone(day: GitHubActivityDay) {
  if (day.is_placeholder) {
    return "border-transparent bg-transparent";
  }

  if (day.level >= 4) {
    return "border-emerald-500/70 bg-emerald-500 dark:border-emerald-400/70 dark:bg-emerald-400";
  }

  if (day.level === 3) {
    return "border-emerald-500/50 bg-emerald-500/80 dark:border-emerald-400/50 dark:bg-emerald-400/80";
  }

  if (day.level === 2) {
    return "border-emerald-500/35 bg-emerald-500/55 dark:border-emerald-400/35 dark:bg-emerald-400/55";
  }

  if (day.level === 1) {
    return "border-emerald-500/20 bg-emerald-500/30 dark:border-emerald-400/20 dark:bg-emerald-400/30";
  }

  return "border-border/60 bg-muted/70 dark:bg-muted/35";
}

function getContributionStyle(day: GitHubActivityDay): CSSProperties | undefined {
  if (day.is_placeholder || !day.color) {
    return undefined;
  }

  return {
    backgroundColor: day.color,
    borderColor: day.color,
  };
}

function formatContributionLabel(day: GitHubActivityDay) {
  const formattedDate = new Date(`${day.date}T00:00:00`).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (day.is_placeholder) {
    return formattedDate;
  }

  if (day.count === 0) {
    return `${formattedDate}: no contributions`;
  }

  const noun = day.count === 1 ? "contribution" : "contributions";
  return `${formattedDate}: ${day.count} ${noun}`;
}

async function getProfileData(): Promise<ProfileData | null> {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://portfolio-backend-824962762241.us-central1.run.app";

    const response = await fetch(`${apiUrl}/api/profile`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch skills profile");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching skills profile:", error);
    return null;
  }
}

async function getGitHubActivity(): Promise<GitHubActivity | null> {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://portfolio-backend-824962762241.us-central1.run.app";

    const response = await fetch(`${apiUrl}/api/github/activity`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch GitHub activity");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching GitHub activity:", error);
    return null;
  }
}

export default async function SkillsPage() {
  const [profileData, githubActivity] = await Promise.all([getProfileData(), getGitHubActivity()]);

  if (!profileData) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 text-center">
        <div className="w-full max-w-3xl rounded-[2rem] border border-border/70 bg-card/95 p-8 shadow-[0_20px_60px_rgba(20,24,62,0.08)]">
          <h1 className="text-2xl font-semibold text-foreground">Unable to load skills</h1>
          <p className="mt-3 text-muted-foreground">
            The skills page could not retrieve profile data. Refresh once and try again.
          </p>
        </div>
      </div>
    );
  }

  const normalizedSkills = normalizeSkills(profileData.skills);
  const skillGroups = groupSkills(normalizedSkills);
  const iconIds = Array.from(
    new Set(
      normalizedSkills
        .map((skill) => (skill.icon || "").trim().toLowerCase())
        .filter(Boolean),
    ),
  );
  const iconUrl = iconIds.length ? `https://skillicons.dev/icons?i=${iconIds.join(",")}&theme=dark` : null;

  const displayName = profileData.basic_info?.name || "Bishal Budhathoki";
  const headline =
    profileData.basic_info?.headline ||
    "Mobile-first software engineer with full-stack product delivery experience.";
  const location = profileData.basic_info?.location || "Sydney";
  const experience = profileData.experience || [];
  const projects = profileData.projects || [];
  const topCategories = skillGroups.slice(0, 3);
  const featuredProjects = projects.slice(0, 3);
  const recentExperience = experience.slice(0, 3);
  const githubYears = githubActivity?.available ? githubActivity.years : [];
  const recentRepositories = githubActivity?.recent_repositories || [];
  const isGraphqlSource = githubActivity?.source === "graphql";

  return (
    <div className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 z-0 bg-[url('/grid-pattern.svg')] opacity-10 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(circle_at_top_left,rgba(59,70,135,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(201,165,92,0.16),transparent_28%),linear-gradient(to_bottom,rgba(238,241,248,0.55),transparent)] dark:bg-[radial-gradient(circle_at_top_left,rgba(99,112,255,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(201,165,92,0.14),transparent_28%),linear-gradient(to_bottom,rgba(20,24,62,0.78),transparent)]" />

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <section className="grid gap-8 lg:grid-cols-[1.35fr,0.95fr] lg:items-end">
          <div className="space-y-6">
            <Badge className="rounded-full border border-accent-foreground/20 bg-accent/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-accent-foreground">
              Skills Snapshot
            </Badge>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Skills expressed through focus areas, tools, and real product work.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                The page is built to read like a serious engineering profile: clear areas of strength, selected technologies,
                and enough proof to show how those skills translate into shipped work.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="rounded-full border border-border/70 bg-card/85 px-4 py-2 shadow-sm">
                {displayName}
              </span>
              <span className="rounded-full border border-border/70 bg-card/85 px-4 py-2 shadow-sm">
                {headline}
              </span>
              <span className="rounded-full border border-border/70 bg-card/85 px-4 py-2 shadow-sm">
                Based in {location}
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_20px_60px_rgba(20,24,62,0.08)]">
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-primary/12 via-primary/6 to-transparent" />
            <div className="relative">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-muted-foreground">At a glance</p>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <p className="text-3xl font-semibold text-foreground">{normalizedSkills.length}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Selected tools and technologies</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <p className="text-3xl font-semibold text-foreground">{skillGroups.length}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Core capability areas</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <p className="text-3xl font-semibold text-foreground">{experience.length}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Roles and internships</p>
                </div>
                <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/12 via-background to-accent/60 p-4">
                  <p className="text-base font-semibold text-foreground">Most visible areas</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {topCategories.map((group) => group.label).join(" · ") || "Core engineering strengths"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_18px_50px_rgba(20,24,62,0.06)] sm:p-8">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-primary/12 via-transparent to-accent/60 dark:from-primary/16 dark:to-accent/15" />
            <div className="relative">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.26em] text-muted-foreground">Technical stack</p>
                  <h2 className="text-2xl font-semibold text-foreground">A quick scan of the tools in active use</h2>
                </div>
              </div>

              <div className="flex min-h-[96px] items-center justify-center rounded-[1.5rem] border border-border/70 bg-background/75 p-4">
                {iconUrl ? (
                  <a
                    href={iconUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl bg-card/80 p-3 transition-opacity hover:opacity-90"
                  >
                    <img src={iconUrl} alt="Technical stack icons" className="max-w-full h-auto" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Technical icons appear here when matching technologies are available.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <Github className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.26em] text-muted-foreground">GitHub activity</p>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold text-foreground">A rolling view of the last two years of shipping</h2>
                {isGraphqlSource ? (
                  <span
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300"
                    title="Live GitHub GraphQL data"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(34,197,94,0.14)]" />
                    GraphQL
                  </span>
                ) : null}
              </div>
              {recentRepositories.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {recentRepositories.map((repository) => (
                    <a
                      key={repository.name_with_owner || repository.url}
                      href={repository.url || githubActivity?.profile_url || "https://github.com/BishalBudhathoki"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/90 px-3 py-1.5 text-sm text-foreground shadow-sm transition-colors hover:border-primary/30 hover:text-primary"
                      title={
                        repository.last_commit_at
                          ? `Last commit ${new Date(repository.last_commit_at).toLocaleDateString("en-AU", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}`
                          : repository.name_with_owner || repository.name || "Repository"
                      }
                    >
                      <span className="text-muted-foreground">Recently worked repo</span>
                      <span className="font-medium">
                        {repository.name_with_owner || repository.name || "Repository"}
                      </span>
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {githubYears.length > 0 ? (
            <div className="grid gap-6 xl:grid-cols-2">
              {githubYears.map((year) => {
                const monthLabels = new Map(year.month_labels.map((item) => [item.week_index, item.label]));

                return (
                  <article
                    key={year.year}
                    className="relative overflow-hidden rounded-[1.85rem] border border-border/70 bg-card/95 p-6 shadow-[0_18px_50px_rgba(20,24,62,0.06)]"
                  >
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-emerald-500/14 via-emerald-500/5 to-transparent" />
                    <div className="relative">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">{year.year}</p>
                          <h3 className="mt-2 text-2xl font-semibold text-foreground">
                            {year.total_contributions.toLocaleString()} contributions
                          </h3>
                          <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
                            {year.active_days} active days
                            {year.busiest_day
                              ? ` · Peak day ${year.busiest_day.count} contributions on ${new Date(
                                  `${year.busiest_day.date}T00:00:00`,
                                ).toLocaleDateString("en-AU", {
                                  day: "numeric",
                                  month: "short",
                                })}`
                              : ""}
                          </p>
                        </div>

                        <a
                          href={githubActivity?.profile_url || "https://github.com/BishalBudhathoki"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background/85 text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                          aria-label="Open GitHub profile"
                          title="Open GitHub profile"
                        >
                          <Github className="h-5 w-5" />
                        </a>
                      </div>

                      <div className="mt-6 overflow-x-auto">
                        <div className="min-w-[720px]">
                          <div
                            className="mb-2 ml-10 grid gap-1.5"
                            style={{ gridTemplateColumns: `repeat(${year.weeks.length}, minmax(0, 1fr))` }}
                          >
                            {year.weeks.map((week, index) => (
                              <span key={`${week.first_day}-label`} className="text-[11px] text-muted-foreground">
                                {monthLabels.get(index) || ""}
                              </span>
                            ))}
                          </div>

                          <div className="flex gap-3">
                            <div className="grid grid-rows-7 gap-1.5 pt-[2px] text-[11px] text-muted-foreground">
                              {["Sun", "", "Tue", "", "Thu", "", "Sat"].map((label, index) => (
                                <span key={`${year.year}-weekday-${index}`} className="h-3 leading-3">
                                  {label}
                                </span>
                              ))}
                            </div>

                            <div
                              className="grid auto-cols-max grid-flow-col gap-1.5"
                              style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
                            >
                              {year.weeks.flatMap((week) =>
                                week.days.map((day) => (
                                  <span
                                    key={day.date}
                                    className={`h-3.5 w-3.5 rounded-[4px] border transition-transform hover:scale-110 ${getContributionTone(
                                      day,
                                    )}`}
                                    style={getContributionStyle(day)}
                                    title={formatContributionLabel(day)}
                                    aria-label={formatContributionLabel(day)}
                                  />
                                )),
                              )}
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-4 text-[11px] text-muted-foreground">
                            <p>Daily contribution cadence across the year.</p>
                            <div className="flex items-center gap-2">
                              <span>Less</span>
                              {[0, 1, 2, 3, 4].map((level) => (
                                <span
                                  key={`${year.year}-legend-${level}`}
                                  className={`h-3 w-3 rounded-[4px] border ${getContributionTone({
                                    date: year.range_start,
                                    count: level,
                                    level,
                                    color: null,
                                    is_placeholder: false,
                                    weekday: 0,
                                  })}`}
                                  style={getContributionStyle({
                                    date: year.range_start,
                                    count: level,
                                    level,
                                    color:
                                      level === 0
                                        ? "#ebedf0"
                                        : level === 1
                                          ? "#9be9a8"
                                          : level === 2
                                            ? "#40c463"
                                            : level === 3
                                              ? "#30a14e"
                                              : "#216e39",
                                    is_placeholder: false,
                                    weekday: 0,
                                  })}
                                />
                              ))}
                              <span>More</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <article className="relative overflow-hidden rounded-[1.85rem] border border-border/70 bg-card/95 p-6 shadow-[0_18px_50px_rgba(20,24,62,0.06)]">
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-emerald-500/14 via-emerald-500/5 to-transparent" />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">GitHub activity will appear here</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                    {githubActivity?.message || "The profile could not retrieve GitHub contribution data right now."}
                  </p>
                </div>
                <a
                  href={githubActivity?.profile_url || "https://github.com/BishalBudhathoki"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background/85 text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                  aria-label="Open GitHub profile"
                  title="Open GitHub profile"
                >
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </article>
          )}
        </section>

        <section className="mt-14">
          <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                  <Rocket className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.26em] text-muted-foreground">Focus areas</p>
                  <h2 className="text-2xl font-semibold text-foreground">The work grouped into clear engineering domains</h2>
                </div>
              </div>

          <div className="grid gap-5 md:grid-cols-2">
            {skillGroups.map((group) => {
              const visual = getCategoryVisual(group.label);
              const Icon = visual.icon;

              return (
                <article
                  key={group.key}
                  className="relative overflow-hidden rounded-[1.85rem] border border-border/70 bg-card/95 p-6 shadow-[0_18px_50px_rgba(20,24,62,0.06)]"
                >
                  <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${visual.accent}`} />
                  <div className="relative">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">{group.label}</h3>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                          {getCategoryDescription(group.label)}
                        </p>
                      </div>
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${visual.chip}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2.5">
                      {group.skills.map((skill, index) => (
                        <span
                          key={`${group.key}-${skill.name}`}
                          className={`rounded-full border px-3 py-1.5 text-sm shadow-sm ${
                            index < 4
                              ? "border-border/70 bg-background/90 text-foreground"
                              : "border-border/60 bg-background/65 text-muted-foreground"
                          }`}
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-[1.08fr,0.92fr]">
          <article className="relative overflow-hidden rounded-[1.85rem] border border-border/70 bg-card/95 p-6 shadow-[0_18px_50px_rgba(20,24,62,0.06)]">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-primary/12 via-primary/6 to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.26em] text-muted-foreground">Proof of work</p>
                  <h2 className="text-2xl font-semibold text-foreground">Recent experience</h2>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {recentExperience.map((item, index) => (
                  <div
                    key={`${item.title || item.role || "role"}-${index}`}
                    className="rounded-2xl border border-border/70 bg-background/85 p-4 shadow-sm"
                  >
                    <p className="text-lg font-medium text-foreground">{item.title || item.role || "Software Role"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatCompany(item.company) || "Company unavailable"}
                      {item.date_range ? ` · ${item.date_range}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="relative overflow-hidden rounded-[1.85rem] border border-border/70 bg-card/95 p-6 shadow-[0_18px_50px_rgba(20,24,62,0.06)]">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-accent/90 via-accent/45 to-transparent dark:from-accent/30 dark:via-accent/10" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent-foreground/20 bg-accent/60 text-accent-foreground">
                  <ArrowRight className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.26em] text-muted-foreground">Selected builds</p>
                  <h2 className="text-2xl font-semibold text-foreground">Projects that support the skill profile</h2>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {featuredProjects.map((project, index) => {
                  const title = project.name || project.title || `Project ${index + 1}`;

                  return (
                    <div
                      key={`${title}-${index}`}
                      className="rounded-2xl border border-border/70 bg-background/85 p-4 shadow-sm"
                    >
                      <p className="text-lg font-medium text-foreground">{title}</p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {project.description || "Project description unavailable."}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </article>
        </section>

        <section className="mt-14 relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_18px_50px_rgba(20,24,62,0.06)] sm:p-8">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-primary/10 via-transparent to-accent/60 dark:from-primary/16 dark:to-accent/15" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.26em] text-muted-foreground">Working style</p>
              <h2 className="text-2xl font-semibold text-foreground">How the profile is framed</h2>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              See related projects
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              "Focus on areas of real delivery rather than generic scoring.",
              "Show tools as part of grouped practice, not isolated buzzwords.",
              "Use projects and experience as the proof behind the stack.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-border/70 bg-background/85 p-5 shadow-sm">
                <p className="text-lg font-medium text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
