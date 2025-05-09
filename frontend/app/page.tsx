'use client';

import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { Briefcase, GraduationCap, ArrowRight, Download, ArrowDownToLine, ExternalLink, Calendar, MapPin, Code, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import "./animations.css"; // Import animation styles from CSS file
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProfileData, Experience } from './types';
import { useApi } from '@/hooks/useApi';
import { MessageCircle } from 'lucide-react';

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

export default function Home() {
  const { data: profileData, error, isLoading } = useApi<ProfileData>('/profile', {
    dedupingInterval: 300000, // 5 minutes cache
  });
  
  const isError = !!error;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <LoadingSpinner size="large" showText />
      </div>
    );
  }
  
  if (isError || !profileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Unable to load profile data</h2>
        <p className="text-muted-foreground mb-8">
          There was a problem loading the profile information. Please try again later.
        </p>
        <Button onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    );
  }
  
  const { basic_info, experience, skills, cv_url, projects } = profileData;
  
  // Use the name from basic_info or fallback to a default
  const displayName = basic_info?.name || "Bishal Budhathoki";

  return (
    <div className="bg-background">
      {/* Hero Section with theme-aware background */}
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
                <a href={process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/BishalBudhathoki"} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-border bg-card hover:bg-card/80 text-foreground transition-colors" aria-label="GitHub">
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
                
                {/* Main image container */}
                {/* Profile image with pop-out effect */}
                <div className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] relative z-10">
                  <div className="relative w-full h-full">
                    {/* Background circle with perfect bottom match */}
                    <div className="absolute inset-x-4 top-16 bottom-4 rounded-full bg-gradient-to-br from-primary/20 via-transparent to-accent-foreground/20 opacity-50 border border-accent-foreground/10"></div>
                    
                    {/* Image container */}
                    <div className="absolute -top-6 inset-x-0 bottom-0 rounded-full overflow-hidden">
                      <div className="w-full h-[115%] scale-105 transform origin-top">
                        <Image
                          src={LOCAL_PROFILE_IMAGE}
                          alt={basic_info?.name || "Bishal Budhathoki"}
                          fill
                          priority
                          className="object-cover hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 400px, 450px"
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

      {/* Featured Experience Section with theme-aware background */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-background to-background dark:from-[#131c48] dark:to-[#0a0f2a]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-14">
            <div className="inline-flex items-center justify-center p-1 px-3 mb-5 border border-accent-foreground/30 rounded-full bg-accent-foreground/5 text-accent-foreground text-sm font-medium">
              <Briefcase className="w-4 h-4 mr-2" />
              Professional Journey
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-8">
              Work Experience
            </h2>
            <div className="w-20 h-1 bg-accent-foreground rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {experience && experience.length > 0 ? (
              experience.slice(0, 2).map((exp: Experience, index: number) => (
                <div
                  key={index}
                  className="bg-card rounded-xl shadow-md p-8 card-compact border border-border hover:shadow-lg hover:border-accent-foreground/30 transition-all duration-300"
                >
                  <div className="flex items-start">
                    <div className="shrink-0 mr-4 bg-primary/20 p-3 rounded-full">
                      <Briefcase className="text-primary w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg sm:text-xl text-foreground mb-2">{exp.title}</h3>
                      <p className="text-muted-foreground mb-2 font-medium">
                        {exp.company}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground/70 mb-4 inline-flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-accent-foreground" />
                        {exp.date_range}
                      </p>
                      <p className="text-sm text-muted-foreground/80 line-clamp-3">{exp.description}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <div className="bg-card rounded-xl border border-border p-8">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-primary/30" />
                  <p className="text-muted-foreground font-medium">Experience information is currently unavailable.</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-center mt-14">
            <Button asChild variant="outline" className="group rounded-full border-accent-foreground text-accent-foreground hover:bg-accent-foreground/10 hover:border-accent-foreground">
              <Link href="/about">
                View Full Experience
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Skills Overview with theme-aware styling */}
      <section className="py-12 md:py-16 bg-background dark:bg-[#0a0f2a]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-14">
            <div className="inline-flex items-center justify-center p-1 px-3 mb-5 border border-accent-foreground/30 rounded-full bg-accent-foreground/5 text-accent-foreground text-sm font-medium">
              <Code className="w-4 h-4 mr-2" />
              Expertise
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-8">
              Skills & Technologies
            </h2>
            <div className="w-20 h-1 bg-accent-foreground rounded-full"></div>
          </div>
          
          <div className="max-w-5xl mx-auto">
            {/* Modern skills showcase */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Technical Skills - Takes up more space */}
              <div className="md:col-span-7 bg-gradient-to-br from-card to-card/80 rounded-2xl shadow-lg border border-border/40 overflow-hidden group hover:border-primary/30 transition-all duration-300 relative">
                {/* Floating Tech Icons */}
                <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
                  <div className="absolute top-5 left-10 w-12 h-12 animate-float animation-delay-2000">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="text-primary w-full h-full"><path d="M0 0h24v24H0V0z" fill="none"/><path fill="currentColor" d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>
                  </div>
                  <div className="absolute top-20 right-10 w-10 h-10 animate-float animation-delay-3000">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="text-accent-foreground w-full h-full"><path fill="none" d="M0 0h24v24H0z"/><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                  </div>
                  <div className="absolute bottom-10 left-20 w-8 h-8 animate-float animation-delay-4000">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="text-[#6370ff] w-full h-full"><path fill="none" d="M0 0h24v24H0z"/><path fill="currentColor" d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
                  </div>
                  <div className="absolute top-40 right-40 w-14 h-14 animate-float animation-delay-1000">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="text-emerald-500 w-full h-full"><path fill="none" d="M0 0h24v24H0z"/><path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/></svg>
                  </div>
                  <div className="absolute bottom-20 right-20 w-9 h-9 animate-float animation-delay-5000">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="text-purple-500 w-full h-full"><path fill="none" d="M0 0h24v24H0z"/><path fill="currentColor" d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/></svg>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center shadow-sm mr-4 group-hover:scale-110 transition-transform duration-300">
                      <Code className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Technical Skills</h3>
                  </div>
                  
                  <div className="space-y-5">
                    {/* Frontend Development */}
                    <div className="space-y-3">
                      <h4 className="text-md font-semibold text-foreground/90 border-l-2 border-primary pl-3">Frontend Development</h4>
                      <div className="flex flex-wrap gap-2">
                        {skills && ('technical' in skills) && Array.isArray(skills.technical) ?
                          skills.technical.filter(skill => 
                            ['javascript', 'react', 'next', 'vue', 'html', 'css', 'typescript', 'angular', 'ui', 'frontend', 'jsx', 'web', 'dom', 'responsive', 'scss', 'sass'].some(
                              tech => skill.toLowerCase().includes(tech.toLowerCase())
                            )
                          ).slice(0, 6).map((skill, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium transition-all hover:scale-105">
                              {skill}
                            </span>
                          )) : null
                        }
                      </div>
                    </div>
                    
                    {/* Backend Development */}
                    <div className="space-y-3">
                      <h4 className="text-md font-semibold text-foreground/90 border-l-2 border-accent-foreground pl-3">Backend Development</h4>
                      <div className="flex flex-wrap gap-2">
                        {skills && ('technical' in skills) && Array.isArray(skills.technical) ?
                          skills.technical.filter(skill => 
                            ['node', 'express', 'django', 'python', 'java', 'php', 'api', 'graphql', 'rest', 'backend', 'flask', 'server', 'fastapi', 'spring', 'ruby'].some(
                              tech => skill.toLowerCase().includes(tech.toLowerCase())
                            )
                          ).slice(0, 5).map((skill, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-accent-foreground/10 hover:bg-accent-foreground/20 text-accent-foreground border border-accent-foreground/30 rounded-full text-sm font-medium transition-all hover:scale-105">
                              {skill}
                            </span>
                          )) : null
                        }
                      </div>
                    </div>
                    
                    {/* Databases & Tools */}
                    <div className="space-y-3">
                      <h4 className="text-md font-semibold text-foreground/90 border-l-2 border-[#6370ff] pl-3">Databases & Tools</h4>
                      <div className="flex flex-wrap gap-2">
                        {skills && ('technical' in skills) && Array.isArray(skills.technical) ?
                          skills.technical.filter(skill => 
                            ['sql', 'mongodb', 'postgres', 'mysql', 'firebase', 'database', 'db', 'query', 'orm', 'nosql', 'redis', 'elasticsearch'].some(
                              tech => skill.toLowerCase().includes(tech.toLowerCase())
                            )
                          ).slice(0, 5).map((skill, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-[#6370ff]/10 hover:bg-[#6370ff]/20 text-[#6370ff] border border-[#6370ff]/30 rounded-full text-sm font-medium transition-all hover:scale-105">
                              {skill}
                            </span>
                          )) : null
                        }
                      </div>
                    </div>
                    
                    {/* DevOps & Cloud */}
                    <div className="space-y-3">
                      <h4 className="text-md font-semibold text-foreground/90 border-l-2 border-emerald-500 pl-3">DevOps & Cloud</h4>
                      <div className="flex flex-wrap gap-2">
                        {skills && ('technical' in skills) && Array.isArray(skills.technical) ?
                          skills.technical.filter(skill => 
                            ['aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes', 'jenkins', 'ci', 'cd', 'git', 'devops', 'github', 'gitlab', 'terraform', 'infrastructure', 'deploy'].some(
                              tech => skill.toLowerCase().includes(tech.toLowerCase())
                            )
                          ).slice(0, 5).map((skill, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-full text-sm font-medium transition-all hover:scale-105">
                              {skill}
                            </span>
                          )) : null
                        }
                      </div>
                    </div>
                    
                    {/* AI & ML */}
                    <div className="space-y-3">
                      <h4 className="text-md font-semibold text-foreground/90 border-l-2 border-purple-500 pl-3">AI & Machine Learning</h4>
                      <div className="flex flex-wrap gap-2">
                        {skills && ('technical' in skills) && Array.isArray(skills.technical) ?
                          skills.technical.filter(skill => 
                            ['ai', 'ml', 'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'nlp', 'neural', 'gpt', 'chatgpt', 'data science', 'opencv', 'computer vision', 'llm'].some(
                              tech => skill.toLowerCase().includes(tech.toLowerCase())
                            )
                          ).slice(0, 5).map((skill, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 border border-purple-500/30 rounded-full text-sm font-medium transition-all hover:scale-105">
                              {skill}
                            </span>
                          )) : null
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Soft Skills & Additional Info */}
              <div className="md:col-span-5 space-y-6">
                {/* Soft Skills with new design */}
                <div className="bg-gradient-to-br from-card to-card/80 rounded-2xl shadow-lg border border-border/40 p-6 md:p-8 group hover:border-accent-foreground/30 transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-xl bg-accent-foreground/10 text-accent-foreground flex items-center justify-center shadow-sm mr-4 group-hover:scale-110 transition-transform duration-300">
                      <UserRound className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Soft Skills</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {skills && ('soft' in skills) && Array.isArray(skills.soft) && skills.soft.length > 0 ? (
                      skills.soft.slice(0, 6).map((skill, index) => (
                        <div key={index} className="flex items-center gap-3 group/skill p-2 hover:bg-accent-foreground/5 rounded-lg transition-colors">
                          <div className="w-2 h-2 rounded-full bg-accent-foreground group-hover/skill:scale-125 transition-transform"></div>
                          <p className="text-muted-foreground group-hover/skill:text-foreground transition-colors">{skill}</p>
                        </div>
                      ))
                    ) : (
                      <div>
                        {/* Default soft skills when none are provided */}
                        {['Problem Solving', 'Communication', 'Team Collaboration', 'Critical Thinking', 'Time Management', 'Adaptability'].map((skill, index) => (
                          <div key={index} className="flex items-center gap-3 group/skill p-2 hover:bg-accent-foreground/5 rounded-lg transition-colors">
                            <div className="w-2 h-2 rounded-full bg-accent-foreground group-hover/skill:scale-125 transition-transform"></div>
                            <p className="text-muted-foreground group-hover/skill:text-foreground transition-colors">{skill}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Experience Level Indicator - Calculate from experience data */}
                <div className="bg-gradient-to-br from-card to-card/80 rounded-2xl shadow-lg border border-border/40 p-6 md:p-8 group hover:border-primary/30 transition-all duration-300">
                  <h3 className="text-lg font-bold text-foreground mb-4">Years of Experience</h3>
                  <div className="space-y-4">
                    {experience && experience.length > 0 ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Frontend Development</span>
                            <span className="text-primary font-medium">
                              {(() => {
                                // Calculate years for frontend
                                const frontendYears = experience
                                  .filter(exp => 
                                    exp.title?.toLowerCase().includes('frontend') || 
                                    exp.title?.toLowerCase().includes('web') ||
                                    exp.description?.toLowerCase().includes('frontend') ||
                                    (exp.technologies && Array.isArray(exp.technologies) && exp.technologies.some(tech => 
                                      ['javascript', 'react', 'html', 'css', 'ui', 'frontend'].some(t => 
                                        tech.toLowerCase().includes(t)
                                      )
                                    ))
                                  )
                                  .reduce((years, exp) => {
                                    if (!exp.date_range) return years;
                                    const match = exp.date_range.match(/(\d{4})/g);
                                    if (match && match.length >= 1) {
                                      const startYear = parseInt(match[0]);
                                      const endYear = match.length > 1 && match[1] !== 'Present' 
                                        ? parseInt(match[1]) 
                                        : new Date().getFullYear();
                                      return years + (endYear - startYear);
                                    }
                                    return years;
                                  }, 0);
                                return frontendYears > 0 ? frontendYears : 5;
                              })()}+ Years
                            </span>
                          </div>
                          <div className="h-2 bg-background rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: '90%' }}></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Backend Development</span>
                            <span className="text-accent-foreground font-medium">
                              {(() => {
                                // Calculate years for backend
                                const backendYears = experience
                                  .filter(exp => 
                                    exp.title?.toLowerCase().includes('backend') || 
                                    exp.description?.toLowerCase().includes('backend') ||
                                    (exp.technologies && Array.isArray(exp.technologies) && exp.technologies.some(tech => 
                                      ['node', 'python', 'api', 'backend', 'server', 'java', 'php', 'flask', 'django'].some(t => 
                                        tech.toLowerCase().includes(t)
                                      )
                                    ))
                                  )
                                  .reduce((years, exp) => {
                                    if (!exp.date_range) return years;
                                    const match = exp.date_range.match(/(\d{4})/g);
                                    if (match && match.length >= 1) {
                                      const startYear = parseInt(match[0]);
                                      const endYear = match.length > 1 && match[1] !== 'Present'
                                        ? parseInt(match[1]) 
                                        : new Date().getFullYear();
                                      return years + (endYear - startYear);
                                    }
                                    return years;
                                  }, 0);
                                return backendYears > 0 ? backendYears : 4;
                              })()}+ Years
                            </span>
                          </div>
                          <div className="h-2 bg-background rounded-full overflow-hidden">
                            <div className="h-full bg-accent-foreground rounded-full" style={{ width: '80%' }}></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">DevOps & Cloud</span>
                            <span className="text-[#6370ff] font-medium">
                              {(() => {
                                // Calculate years for devops
                                const devopsYears = experience
                                  .filter(exp => 
                                    exp.title?.toLowerCase().includes('devops') || 
                                    exp.title?.toLowerCase().includes('cloud') || 
                                    exp.description?.toLowerCase().includes('devops') ||
                                    exp.description?.toLowerCase().includes('cloud') ||
                                    (exp.technologies && Array.isArray(exp.technologies) && exp.technologies.some(tech => 
                                      ['aws', 'docker', 'kubernetes', 'cicd', 'devops', 'cloud', 'jenkins', 'git'].some(t => 
                                        tech.toLowerCase().includes(t)
                                      )
                                    ))
                                  )
                                  .reduce((years, exp) => {
                                    if (!exp.date_range) return years;
                                    const match = exp.date_range.match(/(\d{4})/g);
                                    if (match && match.length >= 1) {
                                      const startYear = parseInt(match[0]);
                                      const endYear = match.length > 1 && match[1] !== 'Present'
                                        ? parseInt(match[1]) 
                                        : new Date().getFullYear();
                                      return years + (endYear - startYear);
                                    }
                                    return years;
                                  }, 0);
                                return devopsYears > 0 ? devopsYears : 3;
                              })()}+ Years
                            </span>
                          </div>
                          <div className="h-2 bg-background rounded-full overflow-hidden">
                            <div className="h-full bg-[#6370ff] rounded-full" style={{ width: '70%' }}></div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Frontend Development</span>
                            <span className="text-primary font-medium">5+ Years</span>
                          </div>
                          <div className="h-2 bg-background rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: '90%' }}></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Backend Development</span>
                            <span className="text-accent-foreground font-medium">4+ Years</span>
                          </div>
                          <div className="h-2 bg-background rounded-full overflow-hidden">
                            <div className="h-full bg-accent-foreground rounded-full" style={{ width: '80%' }}></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">DevOps & Cloud</span>
                            <span className="text-[#6370ff] font-medium">3+ Years</span>
                          </div>
                          <div className="h-2 bg-background rounded-full overflow-hidden">
                            <div className="h-full bg-[#6370ff] rounded-full" style={{ width: '70%' }}></div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-14">
              <Button asChild variant="outline" className="group rounded-full border-accent-foreground text-accent-foreground hover:bg-accent-foreground/10 hover:border-accent-foreground">
                <Link href="/skills">
                  Explore All Skills
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Modern CTA section with theme-aware background */}
      <section className="py-12 md:py-16 relative overflow-hidden bg-gradient-to-b from-background to-background dark:from-[#0a0f2a] dark:to-[#131c48]">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-accent-foreground rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center p-1 px-3 mb-5 border border-accent-foreground/30 rounded-full bg-accent-foreground/5 text-accent-foreground text-sm font-medium">
              Let's Connect
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Let's Create Something Amazing Together
            </h2>
            <p className="mb-8 text-muted-foreground max-w-2xl mx-auto">
              I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
            </p>
            <div className="flex flex-wrap gap-5 justify-center">
              <Button asChild className="rounded-full bg-accent-foreground hover:bg-accent-foreground/90 text-background shadow-md shadow-accent-foreground/20 hover:shadow-lg transition-all">
                <Link href="/contact">
                  Get In Touch
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-primary hover:border-primary text-primary hover:bg-primary/10 transition-all">
                <Link href="/projects">
                  View My Projects
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
