export type JobType = 'Full Time' | 'Part Time' | 'Freelance' | 'Internship';

export interface Profile {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  summary: string;
  avatarUrl?: string;
}

export interface Skill {
  id: string;
  category: string;
  name: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  duration: string;
  liveUrl?: string;
  githubUrl?: string;
  bullets: string[];
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  type: JobType;
  duration: string;
  bullets: string[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  duration: string;
  score: string; // e.g., CGPA: 8.59 or Percentage: 73.75%
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  url?: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface PortfolioData {
  profile: Profile;
  skills: Skill[];
  projects: Project[];
  experiences: Experience[];
  educations: Education[];
  certifications: Certification[];
}
