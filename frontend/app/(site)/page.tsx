import React from 'react';
import Link from "next/link";
import Image from "next/image";
import {
  Briefcase,
  GraduationCap,
  ArrowRight,
  Download,
  ArrowDownToLine,
  ExternalLink,
  Calendar,
  MapPin,
  Code,
  UserRound,
  Play,
  Sparkles,
  Smartphone,
  Layers,
  HeartHandshake,
  Gamepad2,
  Home as HomeIcon,
  Github,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import "./animations.css"; // Import animation styles from CSS file
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ServerWarmingScreen } from "@/components/ServerWarmingScreen";
import { ProfileData, Experience } from './types';
import TechMarquee from '@/components/TechMarquee';

// Define a constant for the profile image
const LOCAL_PROFILE_IMAGE = '/images/01.png';

// Convert Google Drive sharing URL to direct download URL
function convertToDriveDirectLink(url: string | null): string | null {
  if (!url) return null;
  
  // Check if the URL is a Google Drive link
  const driveRegex = /https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view/;
  const match = url.match(driveRegex);
  
  if (match && match[1]) {
    // Return direct download URL using the file ID
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  
  // If not a Google Drive link or not in the expected format, return original URL
  return url;
}

// Add static page config
export const dynamic = "force-dynamic"; // Always evaluate fresh data
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
    technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
  }));

  // Handle skills whether an array of objects or an object
  let technicalList: string[] = [];
  let softList: string[] = [];

  if (Array.isArray(data.skills)) {
    data.skills.forEach((s: any) => {
      const name = typeof s === 'string' ? s.trim() : (s.name || '').trim();
      const cat = typeof s === 'object' ? (s.category || '') : '';
      if (!name) return;
      if (cat.toLowerCase().includes('soft') || /problem solving|communication|leadership|adaptability|multi-task/i.test(name)) {
        softList.push(name);
      } else {
        technicalList.push(name);
      }
    });
  } else if (data.skills && typeof data.skills === 'object') {
    technicalList = Array.isArray(data.skills.technical) ? data.skills.technical : [];
    softList = Array.isArray(data.skills.soft) ? data.skills.soft : [];
  }

  if (softList.length === 0) {
    softList = ['Problem Solving', 'Team Leadership', 'Skilled Multi-tasker', 'Student Leadership', 'Adaptability', 'Communication'];
  }

  return {
    ...data,
    basic_info: {
      ...data.basic_info,
      name: data.basic_info?.name || "Bishal Budhathoki",
      headline: data.basic_info?.headline || "Software Engineer | Full-Stack Dev | Flutter, Kotlin, Java, NodeJS",
      location: data.basic_info?.location || "Sydney",
      profile_image_url: "/images/01.png",
    },
    experience: normalizedExperience,
    skills: {
      technical: technicalList,
      soft: softList,
      raw: Array.isArray(data.skills) ? data.skills : [],
    },
    projects: Array.isArray(data.projects) ? data.projects.map((p: any) => ({
      ...p,
      title: p.title || p.name || 'Project',
      name: p.name || p.title || 'Project',
    })) : [],
    cv_url: data.cv_url || 'https://drive.google.com/file/d/1KwrQenriXayZag4hPT9H2d_Jzw605JvV/view?usp=sharing',
  };
}

/**
 * Fetch profile data server-side with cold-start tolerance.
 */
async function getProfileData(): Promise<ProfileData | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://portfolio-backend-824962762241.us-central1.run.app';
  const attempts = 4;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const timeoutMs = 6000 + attempt * 2000;
      const response = await fetch(`${apiUrl}/api/profile`, {
        next: { revalidate: 0 },
        cache: "no-store",
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
        console.warn(`[Cold Start] Backend still booting after ${attempts} attempts:`, error instanceof Error ? error.message : error);
        return null;
      }

      const delayMs = 1500 * attempt;
      console.log(`[Cold Start] Waking up container (attempt ${attempt}/${attempts}). Retrying in ${delayMs}ms...`);
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
  
  const { basic_info, experience, cv_url } = profileData;
  const displayName = basic_info?.name || "Bishal Budhathoki";

  return (
    <div className="bg-background">
      {/* 
        ========================================================================
        Hero Section - Left 100% as original per user instruction
        ========================================================================
      */}
      <section className="relative overflow-hidden py-8 pb-2 md:py-16 bg-gradient-to-b from-background to-background dark:from-[#0a0f2a] dark:to-[#131c48]">
        <div className="absolute inset-0 z-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute w-full h-full z-0">
          <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-background/30 dark:bg-[#0a0f2a]/30 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-accent-foreground/10 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text Content - First on mobile, first on left side on desktop */}
            <div className="order-2 lg:order-1">
              <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium mb-6 border-accent-foreground bg-transparent text-accent-foreground hover:bg-accent-foreground/10 transition-colors">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-foreground opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-foreground"></span>
                </span>
                Available for new opportunities
              </Badge>
              
              <h1 className="text-5xl font-bold tracking-tight mb-4 text-foreground md:text-6xl lg:text-7xl">
                Hi, I&apos;m <span className="text-primary dark:text-[#6370ff]">{displayName}</span>
              </h1>
              
              <p className="text-xl md:text-2xl font-medium text-foreground/90 mb-6">
                {basic_info?.headline || "Full Stack Developer & AI Enthusiast"}
              </p>
              
              <div className="flex items-center text-muted-foreground gap-6 mb-8">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-accent-foreground" />
                  <span>{basic_info?.location || "Remote"}</span>
                </div>
                {cv_url && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-accent-foreground" />
                    <span>Available Now</span>
                  </div>
                )}
              </div>
              
              <p className="mb-8 text-muted-foreground max-w-lg leading-relaxed">
                I create efficient, user-friendly digital solutions that solve real-world problems.
                My portfolio showcases my technical expertise and creative approach to software development.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg transition-all">
                  <Link href="/projects">
                    <Code className="mr-2 h-4 w-4" />
                    View My Work
                  </Link>
                </Button>
                
                {cv_url && (
                  <Button asChild variant="outline" size="lg" className="rounded-full border-accent-foreground hover:border-accent-foreground text-accent-foreground hover:bg-accent-foreground/10 transition-all">
                    <a href={cv_url} target="_blank" rel="noopener noreferrer">
                      <ArrowDownToLine className="mr-2 h-4 w-4" />
                      Download CV
                    </a>
                  </Button>
                )}
                
                <Button asChild variant="ghost" size="lg" className="rounded-full text-foreground hover:bg-foreground/5 hover:text-foreground">
                  <Link href="/contact">
                    <UserRound className="mr-2 h-4 w-4" />
                    Contact Me
                  </Link>
                </Button>
              </div>
              
              {/* Social Links */}
              <div className="flex gap-4 mt-6 mb-6 lg:mb-0">
                <a href={process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/ErBishalBudhathoki"} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-border bg-card hover:bg-card/80 text-foreground transition-colors" aria-label="GitHub">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href={process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://www.linkedin.com/in/bishalbudhathoki/"} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-border bg-card hover:bg-card/80 text-foreground transition-colors" aria-label="LinkedIn">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                  </svg>
                </a>
                <a href={process.env.NEXT_PUBLIC_TWITTER_URL || "https://x.com/bis2vis?s=21"} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-border bg-card hover:bg-card/80 text-foreground transition-colors" aria-label="Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Profile Image - First on desktop right side, after text on mobile */}
            <div className="flex flex-col items-center order-1 lg:order-2">
              <div className="relative overflow-visible">
                {/* Gradient mask for better blending */}
                <div className="absolute -inset-8 bg-gradient-to-b from-transparent via-background/10 to-background/20 dark:via-[#0a0f2a]/10 dark:to-[#0a0f2a]/20 blur-xl rounded-full"></div>
                
                {/* Main image container with pop-out effect */}
                <div className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] relative z-10">
                  <div className="relative w-full h-full">
                    {/* Background circle with perfect bottom match */}
                    <div className="absolute inset-x-4 top-16 bottom-4 rounded-full bg-gradient-to-br from-primary/20 via-transparent to-accent-foreground/20 opacity-50 border border-accent-foreground/10"></div>
                    
                    {/* Image container */}
                    <div className="absolute -top-6 inset-x-0 bottom-0 rounded-full overflow-hidden">
                      <div className="w-full h-[115%] scale-105 transform origin-top">
                        <img
                          src={LOCAL_PROFILE_IMAGE}
                          alt={displayName}
                          className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                          style={{ objectPosition: 'center 30%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        Horizontal Moving Banner of Skills Icons from Skills Page
        ========================================================================
      */}
      <TechMarquee />

      {/* 
        ========================================================================
        Work Experience Section - Refined with badges and tech pills
        ========================================================================
      */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-background to-background dark:from-[#131c48] dark:to-[#0a0f2a]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col items-center mb-14 text-center">
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 mb-4 border border-accent-foreground/30 rounded-full bg-accent-foreground/5 text-accent-foreground text-xs font-semibold tracking-wider uppercase">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Professional Journey</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Work Experience & Industry Programs
            </h2>
            <div className="w-16 h-1 bg-accent-foreground rounded-full mt-4"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {experience && experience.length > 0 ? (
              experience.slice(0, 4).map((exp: Experience, index: number) => {
                const roleTitle = exp.title || exp.role || "Software Engineer";
                const companyName = exp.company?.replace(/^\s+|\s+$/g, '') || "";
                return (
                  <div
                    key={index}
                    className="group bg-card/90 rounded-2xl p-7 border border-border/80 shadow-md hover:shadow-xl hover:border-accent-foreground/40 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-accent-foreground/10 text-accent-foreground border border-accent-foreground/20">
                          {companyName}
                        </span>
                        <span className="inline-flex items-center text-xs text-muted-foreground/80">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 text-accent-foreground" />
                          {exp.date_range}
                        </span>
                      </div>

                      <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                        {roleTitle}
                      </h3>

                      <p className="text-sm text-muted-foreground/90 leading-relaxed mb-4">
                        {exp.description}
                      </p>
                    </div>

                    {/* Tech tags if present */}
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border/60">
                        {exp.technologies.map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/50"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-12">
                <div className="bg-card rounded-2xl border border-border p-8">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-primary/30" />
                  <p className="text-muted-foreground font-medium">Experience information is currently unavailable.</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild variant="outline" className="rounded-full border-accent-foreground text-accent-foreground hover:bg-accent-foreground/10 hover:border-accent-foreground shadow-sm">
              <Link href="/about">
                <span>View Full Career Roadmap</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        REPLACING OLD "SKILLS & TECHNOLOGIES" (which user identified as space filler)
        WITH FEATURED PRODUCTION SYSTEMS & LIVE WORKS SHOWCASE
        ========================================================================
      */}
      <section className="py-14 md:py-20 bg-background dark:bg-[#0a0f2a] relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col items-center mb-14 text-center">
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 mb-4 border border-primary/30 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Production Deliverables</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Featured Systems & Applications
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl">
              Real-world systems shipped across mobile, containerized cloud microservices, and interactive web platforms.
            </p>
            <div className="w-16 h-1 bg-primary rounded-full mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Project 1: CareNest */}
            <div className="group rounded-3xl border border-border/80 bg-card/90 overflow-hidden shadow-lg hover:shadow-2xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="relative h-48 w-full bg-card/50 overflow-hidden border-b border-border/60 flex items-center justify-center">
                  <img
                    src="/images/projects/carenest.png"
                    alt="CareNest App"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-white shadow-sm">
                    Live on Google Play
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    CareNest
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    Care management and automated invoicing platform for Australian NDIS disability support providers. Features multi-tenant architecture, scheduling, shift notes, and bulk invoicing.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Flutter</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Kotlin</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Firebase</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Cloud Run</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between border-t border-border/50 mt-4">
                <a
                  href="https://play.google.com/store/apps/details?id=com.bishal.invoice&pcampaignid=web_share"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:underline"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Google Play Store</span>
                </a>
                <a
                  href="https://github.com/ErBishalBudhathoki/CareNest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full border border-border hover:border-primary/40 text-foreground transition-colors"
                  aria-label="GitHub Repository"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Project 2: Chess With Knight */}
            <div className="group rounded-3xl border border-border/80 bg-card/90 overflow-hidden shadow-lg hover:shadow-2xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="relative h-48 w-full bg-card/50 overflow-hidden border-b border-border/60 flex items-center justify-center">
                  <img
                    src="/images/projects/chess-knight.png"
                    alt="Chess With Knight"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/90 text-white shadow-sm">
                    Live Dokploy Web Game
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    Chess With Knight
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    Interactive 8x8 chessboard strategy web game with randomly generated knight moves, heuristic pathfinding, and custom puzzle mechanics, hosted on Dokploy server.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">Java</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">Algorithms</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">Docker</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">Web</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between border-t border-border/50 mt-4">
                <a
                  href="https://dokploy.bishalbudhathoki.com/chessknight"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Live Game</span>
                </a>
                <a
                  href="https://github.com/ErBishalBudhathoki/Chess-with-Knight"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full border border-border hover:border-primary/40 text-foreground transition-colors"
                  aria-label="GitHub Repository"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Project 3: Tenant-Web-App (Hamro Ghar) */}
            <div className="group rounded-3xl border border-border/80 bg-card/90 overflow-hidden shadow-lg hover:shadow-2xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="relative h-48 w-full bg-card/50 overflow-hidden border-b border-border/60 flex items-center justify-center">
                  <img
                    src="/images/projects/hamro-ghar.png"
                    alt="Hamro Ghar"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/90 text-white shadow-sm">
                    Full-Stack Web App
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    Tenant-Web-App (Hamro Ghar)
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    Full-stack rental management web application helping tenants and landlords manage room listings, leases, rent tracking, and maintenance requests.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">React</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">Node.js</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">Express</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">MongoDB</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between border-t border-border/50 mt-4">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <span>Inspect Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href="https://github.com/ErBishalBudhathoki/Tenant-Web-App"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full border border-border hover:border-primary/40 text-foreground transition-colors"
                  aria-label="GitHub Repository"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Project 4: Don't Fall Game */}
            <div className="group rounded-3xl border border-border/80 bg-card/90 overflow-hidden shadow-lg hover:shadow-2xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="relative h-48 w-full bg-card/50 overflow-hidden border-b border-border/60 flex items-center justify-center">
                  <img
                    src="/images/projects/dont-fall.png"
                    alt="Don't Fall Game"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pink-500/90 text-white shadow-sm">
                    3D Unity Game
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    Don't Fall Game
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    3D physics balance and platform game built in Unity for Android and PC with obstacle courses, gyroscopic balance, and interactive level mechanics.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">Unity</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">C#</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">Android</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">3D Physics</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between border-t border-border/50 mt-4">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <span>Inspect Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href="https://github.com/ErBishalBudhathoki/Dont-Fall-Game"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full border border-border hover:border-primary/40 text-foreground transition-colors"
                  aria-label="GitHub Repository"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-xl transition-all">
              <Link href="/projects">
                <span>View All 8+ Engineering Projects</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        Modern CTA section
        ========================================================================
      */}
      <section className="py-14 md:py-20 relative overflow-hidden bg-gradient-to-b from-background to-background dark:from-[#0a0f2a] dark:to-[#131c48]">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-accent-foreground rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 max-w-4xl">
          <div className="bg-card/70 backdrop-blur-md border border-border/80 rounded-3xl p-8 sm:p-12 text-center shadow-xl">
            <div className="inline-flex items-center justify-center p-1 px-3 mb-5 border border-accent-foreground/30 rounded-full bg-accent-foreground/5 text-accent-foreground text-xs font-semibold tracking-wider uppercase">
              Let&apos;s Connect
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground tracking-tight">
              Let&apos;s Create Something Impactful Together
            </h2>
            <p className="mb-8 text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
              Available for full-time software engineering roles in Sydney and remote contracts. Let&apos;s discuss how I can contribute to your engineering team.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="rounded-full bg-accent-foreground hover:bg-accent-foreground/90 text-background shadow-md shadow-accent-foreground/20 hover:shadow-lg transition-all font-semibold">
                <Link href="/contact">
                  <UserRound className="w-4 h-4 mr-2" />
                  Get In Touch
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-primary/50 hover:border-primary text-foreground hover:bg-primary/10 transition-all font-semibold">
                <Link href="/projects">
                  <Code className="w-4 h-4 mr-2" />
                  Explore Projects
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
