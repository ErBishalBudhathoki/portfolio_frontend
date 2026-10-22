'use client';

import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ExternalLink,
  Code2,
  Github,
  FileText,
  Home,
  Gamepad2,
  Calendar,
  Globe,
  Layout,
  HeartHandshake,
  Laptop,
  Sparkles,
  Smartphone,
  Layers,
  ArrowRight,
  Info,
  Play,
} from 'lucide-react';
import { FALLBACK_PROFILE_DATA } from '@/lib/fallback-data';
import { useApi } from '@/hooks/useApi';
import ProjectDetailModal, { ProjectDetailData } from '@/components/ProjectDetailModal';

interface Project {
  title?: string;
  name?: string;
  description: string;
  date_range?: string;
  url?: string;
  repository?: string;
  live_demo?: string;
  image?: string;
  technologies?: string[];
  category?: string;
}

interface ProfileApiResponse {
  projects?: Project[];
  [key: string]: any;
}

// Visual generator for projects missing screenshots
function getProjectVisual(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes('invoice')) {
    return {
      Icon: FileText,
      gradient: 'from-amber-500/25 via-orange-500/10 to-transparent',
      badge: 'Desktop App • Java',
      accentColor: 'text-amber-500',
      category: 'enterprise',
    };
  }
  if (lower.includes('tenant') || lower.includes('ghar')) {
    return {
      Icon: Home,
      gradient: 'from-emerald-500/25 via-teal-500/10 to-transparent',
      badge: 'Full-Stack Web App',
      accentColor: 'text-emerald-500',
      category: 'web',
    };
  }
  if (lower.includes('chess') || lower.includes('knight')) {
    return {
      Icon: Gamepad2,
      gradient: 'from-purple-500/25 via-indigo-500/10 to-transparent',
      badge: 'Algorithm & Strategy Game',
      accentColor: 'text-purple-500',
      category: 'games',
    };
  }
  if (lower.includes('fall') || lower.includes('game')) {
    return {
      Icon: Gamepad2,
      gradient: 'from-pink-500/25 via-rose-500/10 to-transparent',
      badge: 'Unity Game • Android/PC',
      accentColor: 'text-pink-500',
      category: 'games',
    };
  }
  if (lower.includes('nidhi') || lower.includes('browser')) {
    return {
      Icon: Smartphone,
      gradient: 'from-teal-500/25 via-cyan-500/10 to-transparent',
      badge: 'Android Web Browser',
      accentColor: 'text-teal-400',
      category: 'mobile',
    };
  }
  if (lower.includes('timetable') || lower.includes('schedule')) {
    return {
      Icon: Calendar,
      gradient: 'from-blue-500/25 via-cyan-500/10 to-transparent',
      badge: 'Research & Genetic Algorithm',
      accentColor: 'text-blue-500',
      category: 'research',
    };
  }
  if (lower.includes('care') || lower.includes('nest')) {
    return {
      Icon: HeartHandshake,
      gradient: 'from-primary/30 via-indigo-500/15 to-transparent',
      badge: 'Healthcare & NDIS SaaS',
      accentColor: 'text-primary',
      category: 'mobile',
    };
  }

  return {
    Icon: Laptop,
    gradient: 'from-primary/20 via-accent/10 to-transparent',
    badge: 'Software Engineering',
    accentColor: 'text-primary',
    category: 'web',
  };
}

function getProjectImagesAndLinks(project: Project) {
  const title = (project.title || project.name || '').toLowerCase();
  let image = project.image;
  let live_demo = project.live_demo;
  let repository = project.repository || (project.url?.includes('github.com') ? project.url : undefined);

  if (title.includes('care') || title.includes('nest')) {
    image = image || '/images/projects/carenest.png';
    live_demo = live_demo || 'https://play.google.com/store/apps/details?id=com.bishal.invoice&pcampaignid=web_share';
    repository = repository || 'https://github.com/ErBishalBudhathoki/CareNest';
  } else if (title.includes('chess') || title.includes('knight')) {
    image = image || '/images/projects/chess-knight.png';
    live_demo = 'https://dokploy.bishalbudhathoki.com/chessknight';
    repository = repository || 'https://github.com/ErBishalBudhathoki/Chess-with-Knight';
  } else if (title.includes('fall')) {
    image = image || '/images/projects/dont-fall.png';
    repository = repository || 'https://github.com/ErBishalBudhathoki/Dont-Fall-Game';
  } else if (title.includes('nidhi') || title.includes('browser')) {
    image = image || '/images/projects/nidhi-browser.png';
    repository = repository || 'https://github.com/ErBishalBudhathoki/Nidhi-The-Browser';
  } else if (title.includes('tenant') || title.includes('ghar')) {
    image = image || '/images/projects/hamro-ghar.png';
    repository = repository || 'https://github.com/ErBishalBudhathoki/Tenant-Web-App';
  } else if (title.includes('invoice')) {
    repository = repository || 'https://github.com/ErBishalBudhathoki/Invoice-Generator';
  } else if (title.includes('timetable')) {
    repository = repository || 'https://github.com/ErBishalBudhathoki/Automatic-Timetable-Generation';
  }

  return { image, live_demo, repository };
}

function extractTech(project: Project): string[] {
  if (project.technologies && project.technologies.length > 0) {
    return project.technologies;
  }
  const desc = (project.description || '').toLowerCase();
  const candidates = [
    'Flutter', 'Kotlin', 'Android', 'iOS', 'React', 'Next.js', 'Node.js',
    'Express', 'MongoDB', 'Java', 'Python', 'FastAPI', 'Firebase', 'Cloud Run',
    'Unity', 'C#', 'Genetic Algorithms', 'Docker', 'PostgreSQL', 'WebKit'
  ];
  return candidates.filter((tech) => desc.includes(tech.toLowerCase()));
}

interface ProjectCardProps {
  project: Project;
  index: number;
  onOpenModal: (project: Project) => void;
}

function ProjectCardItem({ project, index, onOpenModal }: ProjectCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const title = project.title || project.name || 'Project';
  const visual = getProjectVisual(title);
  const Icon = visual.Icon;
  const { image, live_demo, repository } = getProjectImagesAndLinks(project);

  return (
    <Card className="group flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/90 shadow-lg hover:shadow-2xl hover:border-primary/40 transition-all duration-300 hover:-translate-y-1.5">
      {/* Media Header: Real Image Preview with Monogram/Icon Fallback */}
      <div
        className="relative h-48 w-full overflow-hidden border-b border-border/60 bg-muted/40 cursor-pointer group/img"
        onClick={() => onOpenModal(project)}
      >
        {image && !imgFailed ? (
          <div className="relative w-full h-full bg-card/50 flex items-center justify-center overflow-hidden">
            <img
              src={image}
              alt={`${title} preview`}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
            <span className="absolute bottom-3 left-3 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-background/85 text-foreground border border-border/70 backdrop-blur-md shadow-sm">
              {visual.badge}
            </span>
          </div>
        ) : (
          <div className={`relative h-full w-full bg-gradient-to-br ${visual.gradient} flex items-center justify-center`}>
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-15 pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl border border-border/80 bg-background/85 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Icon className={`w-7 h-7 ${visual.accentColor}`} />
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-background/70 border border-border/60 text-foreground/80 backdrop-blur-sm">
                {visual.badge}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Card Body */}
      <CardContent className="flex flex-1 flex-col p-6 space-y-4">
        <div className="flex-1 space-y-2">
          <h3
            className="text-xl font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer"
            onClick={() => onOpenModal(project)}
          >
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Tech Stack Pills */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.technologies.slice(0, 4).map((tech, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-border/60 bg-muted/50 text-muted-foreground"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span className="text-xs text-muted-foreground/70 self-center">
                +{project.technologies.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
          <button
            onClick={() => onOpenModal(project)}
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center"
          >
            Details <ArrowRight className="w-3 h-3 ml-1" />
          </button>

          <div className="flex items-center gap-2">
            {repository && (
              <a
                href={repository}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full border border-border/80 bg-background hover:bg-accent/20 text-foreground transition-colors"
                aria-label="GitHub Repository"
                title="View Repository"
              >
                <Github className="w-4 h-4" />
              </a>
            )}

            {live_demo && (
              <a
                href={live_demo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                aria-label="Live Demo"
                title="Open Live Application"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Live Demo</span>
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProjectsPage() {
  const { data: profileData } = useApi<ProfileApiResponse>('/profile');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalProject, setActiveModalProject] = useState<ProjectDetailData | null>(null);

  // Guarantee projects are NEVER empty (robust fallback)
  const allProjects = useMemo(() => {
    const raw = (profileData?.projects && profileData.projects.length > 0)
      ? profileData.projects
      : (FALLBACK_PROFILE_DATA.projects as Project[]);

    return raw.map((p) => {
      const title = p.title || p.name || 'Project';
      const visual = getProjectVisual(title);
      const enriched = getProjectImagesAndLinks(p);
      return {
        ...p,
        title,
        name: title,
        image: enriched.image || p.image,
        live_demo: enriched.live_demo || p.live_demo,
        repository: enriched.repository || p.repository,
        technologies: extractTech(p),
        category: visual.category,
      };
    });
  }, [profileData]);

  // Find flagship project (CareNest)
  const flagshipProject = useMemo(() => {
    return allProjects.find((p) => p.title.toLowerCase().includes('care') || p.title.toLowerCase().includes('nest')) || allProjects[0];
  }, [allProjects]);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') {
      return allProjects;
    }
    return allProjects.filter((p) => (p as any).category === selectedCategory);
  }, [allProjects, selectedCategory]);

  const categories = [
    { id: 'all', label: 'All Projects', count: allProjects.length },
    { id: 'mobile', label: 'Mobile Apps', count: allProjects.filter((p: any) => p.category === 'mobile').length },
    { id: 'web', label: 'Full-Stack Web', count: allProjects.filter((p: any) => p.category === 'web').length },
    { id: 'enterprise', label: 'Enterprise Systems', count: allProjects.filter((p: any) => p.category === 'enterprise').length },
    { id: 'games', label: 'Games & Algorithms', count: allProjects.filter((p: any) => p.category === 'games' || p.category === 'research').length },
  ];

  return (
    <div className="relative min-h-screen bg-background py-14 sm:py-20 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 pointer-events-none" />
      <div className="absolute -top-40 right-10 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-accent/15 rounded-full filter blur-3xl opacity-20 pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-14">
          <Badge className="px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] rounded-full border border-primary/30 bg-primary/10 text-primary mb-4">
            <Code2 className="w-3.5 h-3.5 mr-1.5" />
            Engineering Portfolio
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-5">
            Featured Projects & <span className="text-primary">Systems</span>
          </h1>

          <p className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Real-world applications delivered across mobile (Flutter, Kotlin), scalable microservices, and modern web platforms.
          </p>
        </div>

        {/* Flagship Spotlight Card: CareNest */}
        {flagshipProject && (
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              Flagship Production Build
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-card/95 via-card/85 to-primary/5 p-6 sm:p-10 shadow-2xl backdrop-blur-xl group hover:border-primary/50 transition-all duration-300">
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/15 rounded-full filter blur-3xl group-hover:scale-110 transition-transform duration-500" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      Live on Google Play
                    </span>
                    <Badge variant="outline" className="border-border text-xs text-muted-foreground">
                      NDIS Healthcare SaaS
                    </Badge>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                    {flagshipProject.title}
                  </h2>

                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                    {flagshipProject.description}
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-2xl border border-border/70 bg-background/60 backdrop-blur-sm">
                      <p className="text-xs text-muted-foreground font-medium">Architecture</p>
                      <p className="text-sm font-semibold text-foreground">Multi-Tenant</p>
                    </div>
                    <div className="p-3 rounded-2xl border border-border/70 bg-background/60 backdrop-blur-sm">
                      <p className="text-xs text-muted-foreground font-medium">Client Target</p>
                      <p className="text-sm font-semibold text-foreground">Flutter + Cloud Run</p>
                    </div>
                    <div className="p-3 rounded-2xl border border-border/70 bg-background/60 backdrop-blur-sm col-span-2 sm:col-span-1">
                      <p className="text-xs text-muted-foreground font-medium">Compliance</p>
                      <p className="text-sm font-semibold text-foreground">NDIS Price Guide</p>
                    </div>
                  </div>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {flagshipProject.technologies?.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-medium border border-primary/20 bg-primary/10 text-primary"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-3">
                    {flagshipProject.live_demo && (
                      <Button asChild size="default" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                        <a href={flagshipProject.live_demo} target="_blank" rel="noopener noreferrer">
                          <Smartphone className="w-4 h-4 mr-2" />
                          Google Play Store
                        </a>
                      </Button>
                    )}

                    {flagshipProject.repository && (
                      <Button asChild variant="outline" size="default" className="rounded-full border-border hover:border-primary/40">
                        <a href={flagshipProject.repository} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 mr-2" />
                          GitHub Repo
                        </a>
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="default"
                      className="rounded-full text-muted-foreground hover:text-foreground"
                      onClick={() => setActiveModalProject(flagshipProject)}
                    >
                      <Info className="w-4 h-4 mr-2" />
                      Deep Dive
                    </Button>
                  </div>
                </div>

                {/* Visual Cover Preview with Real Image */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="w-full max-w-sm aspect-square rounded-3xl border border-border/80 bg-gradient-to-br from-primary/20 via-background/80 to-accent/20 p-6 flex flex-col items-center justify-center text-center shadow-2xl relative group/cover overflow-hidden">
                    <div className="w-28 h-28 rounded-3xl bg-background border border-primary/30 shadow-xl overflow-hidden mb-4 group-hover/cover:scale-105 transition-transform duration-300 p-2 flex items-center justify-center">
                      <img
                        src="/images/projects/carenest.png"
                        alt="CareNest App Icon"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-1">CareNest Platform</h3>
                    <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                      Mobile timesheets, progress notes, and automated NDIS bulk invoicing engine
                    </p>
                    <div className="mt-4 inline-flex items-center text-xs font-semibold text-primary gap-1">
                      Multi-Tenant Architecture <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105'
                    : 'bg-card border border-border/70 text-muted-foreground hover:text-foreground hover:border-primary/40'
                }`}
              >
                {cat.label}
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Project Grid with Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProjects.map((project, index) => (
            <ProjectCardItem
              key={project.name || index}
              project={project}
              index={index}
              onOpenModal={(p) => setActiveModalProject(p)}
            />
          ))}
        </div>
      </div>

      {/* Modal Dialog */}
      <ProjectDetailModal
        project={activeModalProject}
        onClose={() => setActiveModalProject(null)}
      />
    </div>
  );
}