import React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  ArrowRight,
  ArrowDownToLine,
  MapPin,
  Calendar,
  Code,
  UserRound,
  Smartphone,
  Server,
  Globe,
  Database,
  Sparkles,
  HeartHandshake,
  ExternalLink,
  Github,
  CheckCircle2,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import './animations.css';
import { ServerWarmingScreen } from '@/components/ServerWarmingScreen';
import { ProfileData, Experience } from './types';
import ThreeCanvas from '@/components/ThreeCanvas';
import TechMarquee from '@/components/TechMarquee';

const LOCAL_PROFILE_IMAGE = '/images/01.png';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function normalizeProfileData(data: any): ProfileData {
  if (!data) return data;

  const rawExperience = Array.isArray(data.experience) ? data.experience : [];
  const normalizedExperience: Experience[] = rawExperience.map((exp: any) => ({
    ...exp,
    title: (exp.title || exp.role || 'Software Engineer').trim(),
    role: (exp.role || exp.title || 'Software Engineer').trim(),
    company: (exp.company || '').replace(/^\s+|\s+$/g, '').trim(),
    date_range: (exp.date_range || '').trim(),
    description: (exp.description || '').trim(),
  }));

  return {
    ...data,
    basic_info: {
      ...data.basic_info,
      name: data.basic_info?.name || 'Bishal Budhathoki',
      headline:
        data.basic_info?.headline ||
        'Software Engineer | Full-Stack Dev | Flutter, Kotlin, Java, NodeJS',
      location: data.basic_info?.location || 'Sydney, Australia',
      profile_image_url: '/images/01.png',
    },
    experience: normalizedExperience,
    projects: Array.isArray(data.projects)
      ? data.projects.map((p: any) => ({
          ...p,
          title: p.title || p.name || 'Project',
          name: p.name || p.title || 'Project',
        }))
      : [],
    cv_url:
      data.cv_url ||
      'https://drive.google.com/file/d/1KwrQenriXayZag4hPT9H2d_Jzw605JvV/view?usp=sharing',
  };
}

async function getProfileData(): Promise<ProfileData | null> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    'https://portfolio-backend-824962762241.us-central1.run.app';
  const attempts = 4;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const timeoutMs = 6000 + attempt * 2000;
      const response = await fetch(`${apiUrl}/api/profile`, {
        next: { revalidate: 0 },
        cache: 'no-store',
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!response.ok) {
        throw new Error(`Profile API responded with status ${response.status}`);
      }

      const data = await response.json();
      if (data && (data.basic_info || data.experience || data.projects)) {
        return normalizeProfileData(data);
      }
      throw new Error('Profile response was empty');
    } catch (error) {
      const isLast = attempt === attempts;
      if (isLast) {
        console.warn(
          `[Cold Start] Backend still booting after ${attempts} attempts:`,
          error instanceof Error ? error.message : error
        );
        return null;
      }
      const delayMs = 1500 * attempt;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return null;
}

export default async function Home() {
  const profileData = await getProfileData();

  if (!profileData) {
    return <ServerWarmingScreen />;
  }

  const { basic_info, experience, cv_url, projects } = profileData;
  const displayName = basic_info?.name || 'Bishal Budhathoki';

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      {/* Hero Section with Interactive Three.js Canvas */}
      <section className="relative overflow-hidden py-14 sm:py-20 md:py-28 bg-gradient-to-b from-background via-background to-card/40">
        {/* Three.js interactive particle mesh */}
        <ThreeCanvas />

        {/* Ambient background glows */}
        <div className="absolute inset-0 z-0 bg-[url('/grid-pattern.svg')] opacity-10 pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-primary/15 rounded-full filter blur-3xl opacity-30 pointer-events-none animate-blob" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-accent/20 rounded-full filter blur-3xl opacity-25 pointer-events-none animate-blob animation-delay-2000" />

        <div className="container relative z-10 mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <Badge
                variant="outline"
                className="px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] border-primary/40 bg-primary/10 text-primary"
              >
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Available for New Engineering Roles
              </Badge>

              <div className="space-y-3">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.08]">
                  Hi, I&apos;m <span className="text-primary">{displayName}</span>
                </h1>
                <p className="text-xl sm:text-2xl font-semibold text-foreground/90">
                  {basic_info?.headline || 'Full-Stack Developer & Software Engineer'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-primary" />
                  <span>{basic_info?.location || 'Sydney, Australia'}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  <span>Full Working Rights in Australia</span>
                </div>
              </div>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                Specialized in building end-to-end mobile applications in Flutter and native Kotlin,
                high-concurrency cloud microservices with FastAPI and Node.js, and modern reactive web platforms.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105"
                >
                  <Link href="/projects">
                    <Code className="mr-2 h-4 w-4" />
                    Explore Projects
                  </Link>
                </Button>

                {cv_url && (
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-full border-border/80 hover:border-primary/50 text-foreground transition-all hover:scale-105"
                  >
                    <a href={cv_url} target="_blank" rel="noopener noreferrer">
                      <ArrowDownToLine className="mr-2 h-4 w-4" />
                      Download Resume
                    </a>
                  </Button>
                )}

                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="rounded-full text-muted-foreground hover:text-foreground"
                >
                  <Link href="/contact">
                    <UserRound className="mr-2 h-4 w-4" />
                    Contact Me
                  </Link>
                </Button>
              </div>

              {/* Social Channels */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mr-2">
                  Connect:
                </span>
                <a
                  href={process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com/ErBishalBudhathoki'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full border border-border/80 bg-card hover:bg-primary/10 hover:border-primary/40 text-foreground transition-colors"
                  aria-label="GitHub Profile"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href={process.env.NEXT_PUBLIC_LINKEDIN_URL || 'https://www.linkedin.com/in/bishalbudhathoki/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full border border-border/80 bg-card hover:bg-primary/10 hover:border-primary/40 text-foreground transition-colors"
                  aria-label="LinkedIn Profile"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                  </svg>
                </a>
              </div>
            </div>

            {/* Hero Right Avatar */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group">
                {/* Glowing ambient ring */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 via-accent/20 to-emerald-400/20 rounded-full blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full overflow-hidden border-4 border-card shadow-2xl bg-card">
                  <img
                    src={LOCAL_PROFILE_IMAGE}
                    alt={displayName}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tech Marquee */}
      <TechMarquee />

      {/* Flagship Product Feature: CareNest */}
      <section className="py-16 md:py-24 bg-card/25 border-b border-border/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-card/95 via-card/85 to-primary/5 p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    Featured Production Platform
                  </span>
                  <Badge variant="outline" className="border-border text-xs text-muted-foreground">
                    CareNest SaaS
                  </Badge>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                  CareNest — Care Management & NDIS Invoicing Platform
                </h2>

                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl">
                  Built to modernize disability care providers in Australia. Features multi-tenant shift tracking,
                  client progress notes, worker timesheets, and automated single-click NDIS bulk invoice generation.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {['Flutter', 'Dart', 'Node.js', 'Google Cloud Run', 'Firebase Firestore', 'NDIS Invoicing'].map(
                    (tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-medium border border-primary/20 bg-primary/10 text-primary"
                      >
                        {tag}
                      </span>
                    )
                  )}
                </div>

                <div className="flex flex-wrap gap-3 pt-3">
                  <Button asChild size="default" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                    <a
                      href="https://play.google.com/store/apps/details?id=com.bishal.invoice&pcampaignid=web_share"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Google Play Store
                    </a>
                  </Button>

                  <Button asChild variant="outline" size="default" className="rounded-full border-border hover:border-primary/40">
                    <a
                      href="https://github.com/ErBishalBudhathoki/CareNest"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      Repository
                    </a>
                  </Button>

                  <Button asChild variant="ghost" size="default" className="rounded-full text-primary hover:underline">
                    <Link href="/projects">
                      View All 8 Projects <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-4 flex justify-center">
                <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-3xl border border-border/80 bg-gradient-to-br from-primary/20 to-accent/10 p-6 flex flex-col items-center justify-center text-center shadow-inner">
                  <HeartHandshake className="w-16 h-16 text-primary mb-3" />
                  <p className="text-sm font-bold text-foreground">CareNest Mobile</p>
                  <p className="text-xs text-muted-foreground mt-1">Cross-Platform Flutter Client</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Engineering Focus Bento Grid (Replaces old bloated bar-chart skills) */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col items-center text-center mb-14">
            <Badge className="px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] rounded-full border border-primary/30 bg-primary/10 text-primary mb-4">
              <Cpu className="w-3.5 h-3.5 mr-1.5" />
              Core Competencies
            </Badge>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Engineering Disciplines & System Focus
            </h2>

            <p className="max-w-2xl text-muted-foreground text-base sm:text-lg leading-relaxed">
              Real capabilities honed across production applications, cloud containerization, and full-stack software architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            {/* Bento Card 1: Mobile Engineering */}
            <div className="lg:col-span-7 rounded-3xl border border-border/70 bg-gradient-to-br from-card to-card/85 p-8 shadow-lg hover:border-primary/40 transition-all duration-300 relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-500 border border-indigo-500/30 flex items-center justify-center shadow-sm">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Mobile App Engineering</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Cross-Platform & Native</p>
                </div>
              </div>

              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6">
                Architecting reactive cross-platform mobile clients in Flutter and native Kotlin.
                Implemented state machines, offline-first syncing, background GPS workflows, and multi-tenant mobile clients deployed to Android and iOS.
              </p>

              <div className="flex flex-wrap gap-2">
                {['Flutter', 'Dart', 'Kotlin', 'Android SDK', 'Android Studio', 'State Management', 'Mobile UI/UX'].map(
                  (tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-medium border border-indigo-500/30 bg-indigo-500/10 text-indigo-400"
                    >
                      {tech}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Bento Card 2: Cloud Microservices & APIs */}
            <div className="lg:col-span-5 rounded-3xl border border-border/70 bg-gradient-to-br from-card to-card/85 p-8 shadow-lg hover:border-primary/40 transition-all duration-300 relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary border border-primary/30 flex items-center justify-center shadow-sm">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Cloud Microservices</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">High-Throughput APIs</p>
                </div>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Asynchronous REST microservices built with Python (FastAPI) and Node.js. Containerized with Docker and deployed to Google Cloud Run with automated CI/CD triggers and memory caching.
              </p>

              <div className="flex flex-wrap gap-2">
                {['FastAPI', 'Node.js', 'Python', 'Google Cloud Run', 'Docker', 'GraphQL', 'REST APIs'].map(
                  (tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-medium border border-primary/30 bg-primary/10 text-primary"
                    >
                      {tech}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Bento Card 3: Modern Web Platforms */}
            <div className="lg:col-span-5 rounded-3xl border border-border/70 bg-gradient-to-br from-card to-card/85 p-8 shadow-lg hover:border-primary/40 transition-all duration-300 relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-500 border border-cyan-500/30 flex items-center justify-center shadow-sm">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Modern Web Architecture</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">SSR, SSG & Performance</p>
                </div>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Enterprise frontends leveraging Next.js App Router, React Server Components (RSC), TypeScript, and Tailwind CSS with sub-second page loads and complete SEO/schema optimization.
              </p>

              <div className="flex flex-wrap gap-2">
                {['Next.js 15', 'React', 'TypeScript', 'Tailwind CSS', 'Shadcn UI', 'Responsive Design'].map(
                  (tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-medium border border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                    >
                      {tech}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Bento Card 4: Enterprise Systems & Data */}
            <div className="lg:col-span-7 rounded-3xl border border-border/70 bg-gradient-to-br from-card to-card/85 p-8 shadow-lg hover:border-primary/40 transition-all duration-300 relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center shadow-sm">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Enterprise Systems & Data</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Compliance & Algorithms</p>
                </div>
              </div>

              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6">
                Relational schema design and document persistence across PostgreSQL, MongoDB, and Firebase Firestore.
                Experienced with algorithmic constraint optimization, dynamic PDF invoice generators, and NDIS price guide mapping.
              </p>

              <div className="flex flex-wrap gap-2">
                {['PostgreSQL', 'MongoDB', 'Firebase', 'Java', 'Core Java', 'Algorithms', 'Billing Engines'].map(
                  (tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    >
                      {tech}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Career Experience Timeline */}
      <section className="py-16 md:py-24 bg-card/25 border-y border-border/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col items-center text-center mb-14">
            <Badge className="px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] rounded-full border border-primary/30 bg-primary/10 text-primary mb-4">
              <Briefcase className="w-3.5 h-3.5 mr-1.5" />
              Career Journey
            </Badge>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Work Experience Highlights
            </h2>

            <p className="max-w-2xl text-muted-foreground text-base leading-relaxed">
              Professional history across mobile development, technical engineering, and top-tier financial technology programs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {experience && experience.length > 0 ? (
              experience.slice(0, 4).map((exp: Experience, index: number) => {
                const roleTitle = exp.title || exp.role || 'Software Engineer';
                const companyName = exp.company?.replace(/^\s+|\s+$/g, '') || '';
                return (
                  <div
                    key={index}
                    className="rounded-3xl border border-border/70 bg-card/90 p-7 shadow-md hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-12 h-12 rounded-2xl bg-primary/15 text-primary border border-primary/30 flex items-center justify-center shadow-sm">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <h3 className="font-bold text-lg sm:text-xl text-foreground">{roleTitle}</h3>
                        <p className="text-primary font-medium text-sm">{companyName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 pb-2">
                          <Calendar className="w-3.5 h-3.5 text-accent-foreground" />
                          {exp.date_range}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {exp.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : null}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" className="rounded-full border-border hover:border-primary/40 text-foreground">
              <Link href="/about">
                View Full Career Timeline & Education
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 md:py-28 relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="container relative z-10 mx-auto px-4 max-w-4xl text-center space-y-6">
          <Badge className="px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] rounded-full border border-primary/30 bg-primary/10 text-primary">
            Let&apos;s Connect
          </Badge>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Looking for a Proven Mobile & Full-Stack Engineer?
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            I am available for software engineering roles, mobile applications (Flutter/Kotlin), and full-stack systems engineering in Sydney, Australia and remote.
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
            >
              <Link href="/contact">Get in Touch Directly</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-border hover:border-primary/40 text-foreground"
            >
              <Link href="/projects">Explore Shipped Work</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
