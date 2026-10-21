import { ProfileData } from '@/app/(site)/types';

export const FALLBACK_PROFILE_DATA: ProfileData = {
  basic_info: {
    name: 'Bishal Budhathoki',
    headline: 'Full Stack Developer | React • Node.js • Python • Cloud & AI Solutions',
    location: 'Sydney, Australia',
    profile_image_url: '/images/01.png',
  },
  experience: [
    {
      title: 'Senior Full Stack Developer',
      company: 'Tech Innovations Ltd',
      date_range: '2021 - Present',
      description: 'Architecting and scaling cloud-native web applications, building microservices, and leading full-stack modern React and Node.js solutions.',
      technologies: ['React', 'Next.js', 'Node.js', 'Python', 'TypeScript', 'GCP', 'Docker'],
    },
    {
      title: 'Full Stack Engineer',
      company: 'Digital Solutions Lab',
      date_range: '2019 - 2021',
      description: 'Developed high-performance REST APIs, real-time analytics integrations, and optimized responsive web interfaces.',
      technologies: ['JavaScript', 'Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS'],
    },
  ],
  education: [
    {
      institution: 'University of Technology Sydney',
      degree: 'Master of Information Technology',
      field: 'Software Engineering',
      date_range: '2016 - 2018',
    },
    {
      institution: 'Tribhuvan University',
      degree: 'Bachelor of Engineering',
      field: 'Computer Engineering',
      date_range: '2011 - 2015',
    },
  ],
  skills: {
    technical: [
      'JavaScript',
      'TypeScript',
      'React',
      'Next.js',
      'Node.js',
      'Python',
      'FastAPI',
      'Tailwind CSS',
      'Docker',
      'Google Cloud (GCP)',
      'PostgreSQL',
      'MongoDB',
      'REST APIs',
      'Git',
    ],
    soft: [
      'Problem Solving',
      'System Architecture',
      'Agile Development',
      'Team Collaboration',
      'Continuous Learning',
    ],
  },
  projects: [
    {
      title: 'CareNest Healthcare Portal',
      description: 'A modern, secure healthcare support platform with dynamic forms, scheduling, and verified privacy workflows.',
      link: 'https://github.com/ErBishalBudhathoki',
      image_url: '/images/projects/project1.png',
      technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Firebase'],
    },
    {
      title: 'Cloud Analytics Platform',
      description: 'Real-time telemetry and metrics visualization tool built to ingest high-frequency events and display interactive insight dashboards.',
      link: 'https://github.com/ErBishalBudhathoki',
      image_url: '/images/projects/project2.png',
      technologies: ['Python', 'FastAPI', 'React', 'Docker', 'GCP'],
    },
    {
      title: 'Automated Portfolio Pipeline',
      description: 'Dynamic portfolio powered by live Google Sheets synchronization, headless scraping, and micro-caching on Google Cloud Run.',
      link: 'https://github.com/ErBishalBudhathoki',
      image_url: '/images/projects/project3.png',
      technologies: ['Next.js', 'Python', 'FastAPI', 'Cloud Run', 'Selenium'],
    },
  ],
  cv_url: 'https://drive.google.com/uc?export=download&id=1',
};

export interface WarmingStage {
  minSeconds: number;
  message: string;
  detail: string;
  progressPercent: number;
}

export const WARMING_STAGES: WarmingStage[] = [
  {
    minSeconds: 0,
    message: 'Brewing fresh bytes & waking up the server ☕',
    detail: 'Our cloud container was resting to save energy. Sending the wake-up ping...',
    progressPercent: 20,
  },
  {
    minSeconds: 5,
    message: 'Spinning up container engines 🚀',
    detail: 'Booting the Python & FastAPI runtime environment on Google Cloud Run...',
    progressPercent: 45,
  },
  {
    minSeconds: 12,
    message: 'Feeding high-grade seeds to the cloud hamster 🐹',
    detail: 'Connecting to database & preparing live Google Sheets synchronizer...',
    progressPercent: 70,
  },
  {
    minSeconds: 22,
    message: 'Polishing pixels & assembling projects ✨',
    detail: 'Almost there! Loading experience timeline, verified skills, and project highlights...',
    progressPercent: 88,
  },
  {
    minSeconds: 35,
    message: 'Final stretch! Giving container a pep talk 💬',
    detail: 'Good code takes a few extra seconds. Preparing to launch your view any second now...',
    progressPercent: 96,
  },
];

export const FUN_TECH_FACTS = [
  '💡 Fun Fact: Google Cloud Run scales instances to 0 when idle to eliminate idle energy consumption!',
  '☕ Developer rule #1: If at first you don’t succeed, call it version 1.0 and blame the cache.',
  '⚡ Modern serverless architecture: 0 idle cost, zero carbon waste, and a friendly 30-second morning stretch.',
  '🚀 Did you know? This portfolio syncs dynamically with live Google Sheets so Bishal never needs to manually rebuild it.',
  '💻 "There are 10 types of people in the world: those who understand binary, and those who don’t."',
];
