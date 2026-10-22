'use client';

import { useState } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  MapPin, 
  Award, 
  CheckCircle2, 
  Terminal, 
  Code2, 
  Sparkles, 
  ExternalLink, 
  ArrowRight, 
  ShieldCheck, 
  Cpu 
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ServerWarmingScreen } from "@/components/ServerWarmingScreen";
import { useApi } from "@/hooks/useApi";
import { FALLBACK_PROFILE_DATA } from "@/lib/fallback-data";

interface BasicInfo {
  name: string;
  headline: string;
  location: string;
  profile_image: string;
}

interface Experience {
  company: string;
  role?: string;
  title?: string;
  date_range: string;
  description: string;
  technologies?: string[];
}

interface Education {
  school?: string;
  institution?: string;
  degree: string;
  field?: string;
  date_range?: string;
}

interface ProfileData {
  basic_info: BasicInfo;
  about?: string;
  experience: Experience[];
  education: Education[];
  skills?: any;
  projects?: any[];
  certifications?: any[];
  last_updated?: string;
}

const FALLBACK_DATA: ProfileData = {
  basic_info: {
    name: FALLBACK_PROFILE_DATA.basic_info.name,
    headline: FALLBACK_PROFILE_DATA.basic_info.headline,
    location: FALLBACK_PROFILE_DATA.basic_info.location,
    profile_image: "/images/02.png",
  },
  about: FALLBACK_PROFILE_DATA.basic_info.about || "",
  experience: (FALLBACK_PROFILE_DATA.experience as Experience[]) || [],
  education: (FALLBACK_PROFILE_DATA.education as Education[]) || [],
  skills: FALLBACK_PROFILE_DATA.skills,
  projects: FALLBACK_PROFILE_DATA.projects,
  certifications: [],
  last_updated: new Date().toISOString(),
};

const PHILOSOPHIES = [
  {
    icon: Code2,
    title: "Architecture First",
    desc: "Designing modular, decoupled microservices and frontends with strict type safety and high maintainability.",
  },
  {
    icon: Cpu,
    title: "Cross-Platform Precision",
    desc: "Shipping native-grade performance across Android, iOS, and Web using Flutter, Kotlin, and modern Next.js.",
  },
  {
    icon: ShieldCheck,
    title: "Production Reliability",
    desc: "Hardening systems with containerized Docker deployments, Cloud Run scaling, automated CI/CD, and robust testing.",
  },
  {
    icon: Sparkles,
    title: "User-Centric UX",
    desc: "Crafting fluid 60fps animations, intuitive ergonomics, and accessible interfaces that convert and engage.",
  },
];

export default function AboutPage() {
  const { data: profileData, isLoading, isWarming } = useApi<ProfileData>('/profile');
  const [imgSrc, setImgSrc] = useState("/images/02.png");

  // Use profileData or guarantee rich fallback
  const rawData = profileData || FALLBACK_DATA;
  const basic_info = rawData.basic_info || FALLBACK_DATA.basic_info;
  const experience = (rawData.experience && rawData.experience.length > 0) 
    ? rawData.experience 
    : (FALLBACK_DATA.experience || []);
  const education = (rawData.education && rawData.education.length > 0) 
    ? rawData.education 
    : (FALLBACK_DATA.education || []);

  const displayName = basic_info?.name || "Bishal Budhathoki";
  const headline = basic_info?.headline || "Software Engineer | Full-Stack Dev | Flutter, Kotlin, Java, NodeJS";
  const location = basic_info?.location || "Sydney, Australia";

  if (isWarming && !profileData) {
    return <ServerWarmingScreen title="Waking Up Server & Loading Profile" />;
  }

  if (isLoading && !profileData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="large" showText />
      </div>
    );
  }

  return (
    <div className="py-14 md:py-20 bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-4 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Profile & Background</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            About <span className="bg-gradient-to-r from-primary via-indigo-400 to-purple-400 bg-clip-text text-transparent">Me</span>
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl">
            Software engineer based in Sydney, specializing in high-performance mobile apps, cloud microservices, and modern web architectures.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent-foreground rounded-full mt-4" />
        </div>

        {/* Executive Bio & Profile Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20 items-start">
          
          {/* Left Column: Avatar & Quick Profile Card */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-stretch">
            <div className="w-full bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              {/* Ambient Glow */}
              <div className="absolute -top-20 -right-20 w-44 h-44 bg-primary/15 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/25 transition-all duration-500" />
              
              {/* Photo */}
              <div className="relative w-56 h-56 mx-auto rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl bg-gradient-to-b from-primary/10 to-card">
                <img
                  src={imgSrc}
                  alt={displayName}
                  onError={() => setImgSrc("/images/01.png")}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
              </div>

              {/* Identity Details */}
              <div className="mt-6 text-center">
                <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
                <p className="text-xs uppercase tracking-wider text-primary font-semibold mt-1">
                  Full-Stack & Mobile Software Engineer
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-accent-foreground" />
                  <span>{location}</span>
                </div>

                {/* Status Pill */}
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Available for Full-Time & Contract Roles</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-5 border-t border-border/60 flex flex-col gap-2.5">
                <Link
                  href="/projects"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-md shadow-primary/20 hover:brightness-110 transition-all"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Explore Shipped Projects</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </Link>
                <Link
                  href="/contact"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card/50 text-foreground font-medium text-sm hover:border-primary/50 hover:bg-card transition-all"
                >
                  <Terminal className="w-4 h-4 text-primary" />
                  <span>Initiate Contact</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-70" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative Story & Key Highlights */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-6 md:p-8 shadow-xl">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" />
                <span>Executive Summary</span>
              </h3>
              
              <div className="prose dark:prose-invert max-w-none text-muted-foreground text-sm md:text-base leading-relaxed space-y-4">
                <p>
                  I am a Sydney-based Software Engineer with a <strong className="text-foreground">Master of Information Technology</strong> from CQUniversity. My engineering journey bridges full-stack cloud systems, native mobile applications, and resilient backend services.
                </p>
                <p>
                  At <strong className="text-foreground">Geeks Australia</strong>, I developed cross-platform mobile solutions utilizing Flutter and Kotlin across Android, iOS, and Web environments. My industry experience also includes engineering programs with <strong className="text-foreground">Beforepay</strong> (Android testing, Firebase releases, and KYC verification pipelines), <strong className="text-foreground">Goldman Sachs</strong> (cybersecurity and password hash analysis), and <strong className="text-foreground">JPMorgan Chase</strong> (financial data feeds and visual trading telemetry).
                </p>
                <p>
                  Recently, I engineered <strong className="text-primary">CareNest</strong>, a comprehensive multi-tenant NDIS care and invoicing platform with role-based access control, compliant PDF generation, and automated shift tracking, currently published on Google Play.
                </p>
              </div>

              {/* Key Competency Badges */}
              <div className="mt-6 pt-6 border-t border-border/60 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-muted/40 border border-border/70 rounded-xl p-3 text-center">
                  <div className="text-xl font-extrabold text-primary">Master's</div>
                  <div className="text-xs text-muted-foreground mt-0.5">CQUniversity IT</div>
                </div>
                <div className="bg-muted/40 border border-border/70 rounded-xl p-3 text-center">
                  <div className="text-xl font-extrabold text-foreground">5+</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Production Apps</div>
                </div>
                <div className="bg-muted/40 border border-border/70 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
                  <div className="text-xl font-extrabold text-emerald-400">Play Store</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Shipped & Live</div>
                </div>
              </div>
            </div>

            {/* Core Values / Philosophy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {PHILOSOPHIES.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={idx} className="bg-card/50 border border-border/70 rounded-xl p-4 hover:border-primary/40 transition-colors">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Experience Section */}
        <div className="mb-20">
          <div className="flex flex-col items-center mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Career Roadmap</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Professional Experience & Industry Programs
            </h2>
            <div className="w-16 h-1 bg-primary rounded-full mt-3" />
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Vertical timeline spine */}
            <div className="absolute left-4 md:left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary via-indigo-500/50 to-border -translate-x-1/2 hidden sm:block" />

            <div className="space-y-8">
              {experience.map((exp: Experience, index: number) => {
                const isEven = index % 2 === 0;
                return (
                  <div key={index} className={`relative flex flex-col sm:flex-row items-start ${isEven ? 'sm:flex-row-reverse' : ''} gap-6 group`}>
                    
                    {/* Timeline Node Icon (Centered on desktop) */}
                    <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 top-4 w-8 h-8 rounded-full bg-card border-2 border-primary items-center justify-center shadow-lg shadow-primary/20 z-10 group-hover:scale-110 transition-transform">
                      <Briefcase className="w-3.5 h-3.5 text-primary" />
                    </div>

                    {/* Card Content */}
                    <div className="w-full sm:w-[calc(50%-2rem)]">
                      <div className="bg-card/80 backdrop-blur-sm border border-border/80 hover:border-primary/50 rounded-2xl p-5 md:p-6 shadow-md transition-all duration-300 hover:shadow-xl group-hover:-translate-y-0.5">
                        
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-semibold text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                            {exp.company?.trim()}
                          </span>
                          <span className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="mr-1.5 h-3.5 w-3.5 text-accent-foreground" />
                            {exp.date_range}
                          </span>
                        </div>

                        <h3 className="text-base md:text-lg font-bold text-foreground mb-2">
                          {exp.role || exp.title || "Software Engineer"}
                        </h3>

                        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-4">
                          {exp.description}
                        </p>

                        {/* Tech tags */}
                        {exp.technologies && exp.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border/50">
                            {exp.technologies.map((tech, tIdx) => (
                              <span 
                                key={tIdx} 
                                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted/60 text-foreground/80 border border-border/60"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Academic Background Section */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academic Credentials</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Education & Professional Qualifications
            </h2>
            <div className="w-16 h-1 bg-primary rounded-full mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {education.map((edu: Education, index: number) => (
              <div 
                key={index}
                className="bg-card/80 backdrop-blur-sm border border-border/80 hover:border-primary/50 rounded-2xl p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1 leading-snug">
                    {edu.degree}
                  </h3>
                  <p className="text-sm font-medium text-primary mb-2">
                    {edu.school || edu.institution}
                  </p>
                  {edu.field && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {edu.field}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                  <span>{edu.date_range || "Graduated"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}