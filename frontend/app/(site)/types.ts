// Define types for profile data
export interface BasicInfo {
  name: string;
  headline: string;
  location: string;
  profile_image_url: string;
}

export interface Experience {
  title: string;
  company: string;
  date_range: string;
  description: string;
  technologies?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  date_range: string;
}

export interface Project {
  title: string;
  description: string;
  image_url: string;
  link: string;
  technologies: string[];
}

export interface Skill {
  name: string;
  category: string;
}

export interface Skills {
  technical: string[];
  soft: string[];
}

export interface ProfileData {
  basic_info: BasicInfo;
  experience: Experience[];
  education: Education[];
  skills: Skills;
  projects: Project[];
  cv_url: string;
} 