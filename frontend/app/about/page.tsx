'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { Briefcase, GraduationCap, Calendar, MapPin } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useApi } from "@/hooks/useApi";

// Define types for profile data
interface BasicInfo {
  name: string;
  headline: string;
  location: string;
  profile_image: string;
}

interface Experience {
  company: string;
  role: string;
  date_range: string;
  description: string;
}

interface Education {
  school: string;
  degree: string;
  date_range: string;
}

interface ProfileData {
  basic_info: BasicInfo;
  about: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: any[];
  certifications: any[];
  last_updated?: string;
}

const FALLBACK_DATA: ProfileData = {
  basic_info: {
    name: "Bishal Budhathoki",
    headline: "Software Developer",
    location: "Remote",
    profile_image: "/images/01.png",
  },
  about: "No information available at the moment.",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  last_updated: new Date().toISOString(),
};

export default function AboutPage() {
  // Use our cached API hook to fetch profile data with caching
  const { data: profileData, error, isLoading } = useApi<ProfileData>('/profile', {
    // Cache profile data for 5 minutes (300000ms)
    dedupingInterval: 300000,
  });

  // Use the profile data or fallback if not available
  const data = profileData || FALLBACK_DATA;
  
  // Ensure local profile image is used
  if (data.basic_info && profileData) {
    data.basic_info.profile_image = "/images/01.png";
  }
  
  const { basic_info, about, experience, education } = data;
  
  // Use the name from basic_info or fallback to a default
  const displayName = basic_info?.name || "Bishal Budhathoki";

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="large" showText />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">{error.message || "Failed to load profile data. Please try again later."}</p>
        <button 
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="flex flex-col items-center mb-16">
          <div className="inline-flex items-center justify-center p-1 px-3 mb-4 border border-accent-foreground/30 rounded-full bg-accent-foreground/5 text-accent-foreground text-sm font-medium">
            About Me
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            My Background & Expertise
          </h1>
          <div className="w-20 h-1 bg-accent-foreground rounded-full"></div>
        </div>
        
        {/* Introduction */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4 lg:col-span-3">
              <div className="sticky top-24">
                <div className="relative w-48 h-48 mx-auto md:w-full md:h-auto md:aspect-square rounded-full md:rounded-xl overflow-hidden border-4 border-card shadow-xl bg-gradient-to-br from-primary/20 via-transparent to-accent-foreground/20">
                  <Image
                    src="/images/02.png"
                    alt={displayName}
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-500"
                    priority
                    sizes="(max-width: 768px) 192px, 33vw"
                    style={{ 
                      objectPosition: 'center -23%',
                      transform: 'scale(1.5)'
                    }}
                  />
                </div>
                <div className="mt-6 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
                  <p className="text-muted-foreground">{basic_info?.headline}</p>
                  {basic_info?.location && (
                    <div className="flex items-center justify-center md:justify-start mt-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1 text-accent-foreground" />
                      <span>{basic_info.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="md:col-span-8 lg:col-span-9">
              <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                <p className="text-xl text-foreground mb-4">
                  Hi, I'm <span className="text-primary font-semibold">{displayName}</span>, a passionate and dedicated
                      developer with a strong focus on creating efficient and
                      user-friendly digital solutions.
                    </p>
                
                {about && (
                  <div className="mt-6 p-6 bg-card rounded-xl border border-border shadow-md">
                    <h3 className="text-foreground font-semibold mb-3">Latest Dynamic Content:</h3>
                    <p className="leading-relaxed">{about}</p>
                  </div>
                )}
                
                <p className="mt-6 leading-relaxed">
                      With expertise in both frontend and backend technologies, I
                      enjoy building complete web applications from concept to
                      deployment. My approach combines technical excellence with a
                      keen eye for user experience and design.
                    </p>
                <p className="leading-relaxed">
                      I'm constantly learning and exploring new technologies to stay
                      at the forefront of the rapidly evolving tech landscape. When
                      I'm not coding, you can find me exploring new technologies,
                      contributing to open-source projects, or sharing knowledge with
                      the community.
                    </p>
              </div>
              
              {data.last_updated && (
                <p className="text-xs text-muted-foreground/60 mt-4">
                  Last updated: {new Date(data.last_updated).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="mb-20">
          <div className="flex flex-col items-center mb-12">
            <div className="inline-flex items-center justify-center p-1 px-3 mb-4 border border-accent-foreground/30 rounded-full bg-accent-foreground/5 text-accent-foreground text-sm font-medium">
              <Briefcase className="w-4 h-4 mr-2" />
              Career Path
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground">
            Professional Experience
          </h2>
            <div className="w-16 h-1 bg-accent-foreground rounded-full mt-4"></div>
          </div>

          <div className="space-y-8 max-w-5xl mx-auto">
            {experience && experience.length > 0 ? (
              experience.map((exp: Experience, index: number) => (
                <div key={index} className="border-l-2 border-primary/50 pl-6 ml-2 relative">
                  <div className="absolute w-4 h-4 bg-primary rounded-full -left-[10px] top-1"></div>
                  <h3 className="text-xl font-bold text-foreground">{exp.role}</h3>
                  <p className="text-lg text-muted-foreground">{exp.company}</p>
                  <div className="flex items-center text-sm text-muted-foreground/70 mt-1 mb-4">
                    <Calendar className="mr-2 h-4 w-4 text-accent-foreground" />
                    {exp.date_range}
                  </div>
                  <p className="text-muted-foreground leading-relaxed bg-card p-4 rounded-lg border border-border">
                    {exp.description || "No description available."}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground italic bg-card p-6 rounded-xl border border-border text-center">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-primary/30" />
                Experience information is currently unavailable.
              </div>
            )}
          </div>
        </div>

        {/* Education Section */}
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center mb-12">
            <div className="inline-flex items-center justify-center p-1 px-3 mb-4 border border-accent-foreground/30 rounded-full bg-accent-foreground/5 text-accent-foreground text-sm font-medium">
              <GraduationCap className="w-4 h-4 mr-2" />
              Academic Background
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground">
            Education
          </h2>
            <div className="w-16 h-1 bg-accent-foreground rounded-full mt-4"></div>
          </div>

          <div className="space-y-8">
            {education && education.length > 0 ? (
              education.map((edu: Education, index: number) => (
                <div key={index} className="border-l-2 border-accent-foreground/50 pl-6 ml-2 relative">
                  <div className="absolute w-4 h-4 bg-accent-foreground rounded-full -left-[10px] top-1"></div>
                  <h3 className="text-xl font-bold text-foreground">{edu.degree}</h3>
                  <p className="text-lg text-muted-foreground">{edu.school}</p>
                  <div className="flex items-center text-sm text-muted-foreground/70 mt-1 mb-4">
                    <Calendar className="mr-2 h-4 w-4 text-accent-foreground" />
                    {edu.date_range}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground italic bg-card p-6 rounded-xl border border-border text-center">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 text-accent-foreground/30" />
                Education information is currently unavailable.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 