// Define types for profile data
export interface BasicInfo {
  name: string;
  headline: string;
  location: string;
  profile_image_url?: string;
  profile_image?: string;
  about?: string;
}

export interface Experience {
  title?: string;
  role?: string;
  company: string;
  date_range: string;
  description: string;
  technologies?: string[];
}

export interface Education {
  institution?: string;
  school?: string;
  degree: string;
  field?: string;
  date_range?: string;
}

export interface Project {
  title?: string;
  name?: string;
  description: string;
  image_url?: string;
  image?: string;
  link?: string;
  repository?: string;
  live_demo?: string;
  technologies?: string[];
  date_range?: string;
}

export interface Skill {
  name: string;
  category: string;
  endorsements?: string | number;
  icon?: string;
  category_order?: string | number;
  skill_order?: string | number;
  display_category?: string;
}

export interface Skills {
  technical: string[];
  soft: string[];
  raw?: Skill[];
}

export interface ProfileData {
  basic_info: BasicInfo;
  about?: string;
  experience: Experience[];
  education: Education[];
  skills: Skills | Skill[] | any;
  projects: Project[];
  cv_url: string;
  certifications?: any[];
  last_updated?: string;
} 