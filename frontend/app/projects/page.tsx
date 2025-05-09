'use client';

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { GitFork, ExternalLink, Code2, Github } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useApi } from "@/hooks/useApi";

interface Project {
  title: string;
  description: string;
  date_range?: string;
  url?: string;
  repository?: string;
  technologies?: string[];
  name?: string;
}

interface ProfileData {
  basic_info: {
    name: string;
    headline: string;
    location: string;
    profile_image: string;
  };
  about: string;
  experience: any[];
  education: any[];
  skills: string[];
  projects: Project[];
  certifications: any[];
}

async function getProfileData(): Promise<ProfileData> {
  try {
    // Get base API URL from env or use relative URL for custom domains
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    
    // Add a timestamp to avoid caching issues
    const timestamp = new Date().getTime();
    const endpoint = `/api/profile?t=${timestamp}`;
    
    console.log(`Projects page - Attempting to fetch profile data using relative URL: ${endpoint}`);
    
    // First try with relative URL (works with Next.js rewrites if on same domain)
    try {
      const res = await fetch(endpoint, {
        next: { revalidate: 0 }, // Disable caching to ensure fresh data
        cache: 'no-store'
      });
      
      if (res.ok) {
        console.log("Projects page - Successfully fetched profile data with relative URL");
        const data = await res.json();
        
        // Validate that we have actual projects data
        if (!data.projects || data.projects.length === 0) {
          console.warn("No projects data found in API response");
          // Return data with default projects array
          return {
            ...data,
            projects: []
          };
        }
        
        // Log project data before mapping
        console.log(`Projects page - Received ${data.projects.length} projects from API`);
        data.projects.forEach((project: any, index: number) => {
          console.log(`Project ${index + 1}:`, 
            project.name ? `name: ${project.name}` : 'no name field',
            project.title ? `title: ${project.title}` : 'no title field');
        });
        
        // Process projects to enhance them with structured technologies
        if (data.projects && data.projects.length > 0) {
          data.projects = data.projects.map(enhanceProjectData);
        }
        
        return data;
      }
    } catch (error) {
      console.error("Projects page - Error fetching with relative URL:", error);
    }
    
    // If relative URL fails and we have a backend URL, try direct fetch
    if (apiUrl) {
      console.log(`Projects page - Falling back to direct backend URL: ${apiUrl}/api/profile`);
      const res = await fetch(`${apiUrl}/api/profile?t=${timestamp}`, {
        next: { revalidate: 0 },
        cache: 'no-store'
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch profile data: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Validate that we have actual projects data
      if (!data.projects || data.projects.length === 0) {
        console.warn("No projects data found in API response");
        // Return data with default projects array
        return {
          ...data,
          projects: []
        };
      }
      
      // Log project data before mapping
      console.log(`Projects page - Received ${data.projects.length} projects from API`);
      data.projects.forEach((project: any, index: number) => {
        console.log(`Project ${index + 1}:`, 
          project.name ? `name: ${project.name}` : 'no name field',
          project.title ? `title: ${project.title}` : 'no title field');
      });
      
      // Process projects to enhance them with structured technologies
      if (data.projects && data.projects.length > 0) {
        data.projects = data.projects.map(enhanceProjectData);
      }
      
      return data;
    } else {
      throw new Error("No API URL available and relative URL failed");
    }
  } catch (error) {
    console.error("Projects page - Error fetching profile data:", error);
    return getDefaultProfileData();
  }
}

function getDefaultProfileData(): ProfileData {
  return {
    basic_info: {
      name: "Bishal Budhathoki",
      headline: "Software Developer",
      location: "Remote",
      profile_image: "",
    },
    about: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  };
}

// Function to enhance project data by extracting technologies from description
function enhanceProjectData(project: Project): Project {
  // Map project.name to project.title if title is missing but name exists
  let enhancedProject = { ...project };
  
  // If project has name but no title, use name as title
  if (!enhancedProject.title && enhancedProject.name) {
    enhancedProject.title = enhancedProject.name;
    console.log(`Mapped project name to title: ${enhancedProject.title}`);
  }
  
  // Add technologies if not already present
  if (!enhancedProject.technologies) {
    enhancedProject.technologies = extractTechnologiesFromDescription(enhancedProject.description);
  }
  
  return enhancedProject;
}

// Function to extract technologies from project description
function extractTechnologiesFromDescription(description: string): string[] {
  // Common tech keywords to look for
  const techKeywords = [
    "React", "JavaScript", "TypeScript", "Next.js", "Node.js", "Express", 
    "MongoDB", "PostgreSQL", "MySQL", "Python", "Django", "Flask", "FastAPI",
    "AWS", "Docker", "Kubernetes", "GraphQL", "REST", "API", "Vue.js", "Angular",
    "CSS", "SCSS", "SASS", "HTML", "Tailwind", "Bootstrap", "Material UI", "Redux",
    "Firebase", "Heroku", "Vercel", "Netlify", "Git", "GitHub", "CI/CD", "Testing"
  ];
  
  if (!description) return [];
  
  // Extract technologies mentioned in the description
  return techKeywords.filter(tech => 
    description.toLowerCase().includes(tech.toLowerCase())
  );
}

export default function ProjectsPage() {
  const { data: profileData, error, isLoading } = useApi<ProfileData>('/profile', {
    dedupingInterval: 300000, // 5 minutes cache
  });
  
  const isError = !!error;
  
  // Process projects to enhance them with structured technologies
  const projects = React.useMemo(() => {
    if (!profileData?.projects || profileData.projects.length === 0) {
      return [];
    }
    
    return profileData.projects.map(enhanceProjectData);
  }, [profileData?.projects]);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="flex flex-col items-center mb-12">
        <div className="inline-flex items-center justify-center p-1 px-3 mb-4 border border-accent-foreground/30 rounded-full bg-accent-foreground/5 text-accent-foreground text-sm font-medium">
          <Code2 className="w-4 h-4 mr-2" />
          Featured Work
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
          My Projects
        </h1>
        <div className="w-20 h-1 bg-accent-foreground rounded-full"></div>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-center">
          Here are some of the projects I've worked on. Each project represents a unique 
          challenge and demonstrates different aspects of my technical skills.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="large" showText />
        </div>
      ) : isError ? (
        <div className="text-center p-8 border border-destructive/20 rounded-lg bg-destructive/5">
          <h3 className="text-xl font-medium mb-2">Error Loading Projects</h3>
          <p className="text-muted-foreground">
            There was a problem loading the projects. Please try again later.
          </p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center p-8 border border-border rounded-lg">
          <h3 className="text-xl font-medium mb-2">No Projects Found</h3>
          <p className="text-muted-foreground">
            There are currently no projects to display.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <Card 
              key={index}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{project.title}</CardTitle>
                {project.date_range && (
                  <CardDescription className="text-muted-foreground text-sm">
                    {project.date_range}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <p className="text-muted-foreground mb-4 text-sm flex-grow">
                  {project.description}
                </p>
                
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 mb-4">
                    {project.technologies.map((tech, techIndex) => (
                      <Badge key={techIndex} variant="outline">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex space-x-3 mt-auto">
                  {project.url && (
                    <Link 
                      href={project.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm flex items-center text-foreground hover:text-accent-foreground transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" /> 
                      Live Demo
                    </Link>
                  )}
                  
                  {project.repository && (
                    <Link 
                      href={project.repository} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm flex items-center text-foreground hover:text-accent-foreground transition-colors"
                    >
                      <Github className="w-4 h-4 mr-1" /> 
                      Repository
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 