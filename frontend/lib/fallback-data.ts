import { ProfileData } from '@/app/(site)/types';

export const FALLBACK_PROFILE_DATA: ProfileData = {
  basic_info: {
    name: 'Bishal Budhathoki',
    headline: 'Software Engineer | Full-Stack Dev | Flutter, Kotlin, Java, NodeJS',
    location: 'Sydney, Australia',
    profile_image_url: '/images/01.png',
    about: 'As a mobile app developer at Geeks Australia, I enhanced the in-house pre-existing application project that included web, android, and iOS platforms, using Flutter and Kotlin. I also worked on new and existing customer projects, delivering high-quality and user-friendly products.\n\nI have a Master of Information Technology degree from CQUniversity, with a focus on software engineering, software development, and mobile application development. I have also completed several virtual programs and certifications from leading companies, such as JPMorgan Chase, Univative, and Goldman Sachs, to expand my skills and knowledge in the field.\n\nI am passionate about creating innovative and impactful software solutions, using various programming languages, tools, and frameworks, such as Java, Kotlin, Unity, Firebase, and GitHub.',
  },
  experience: [
    {
      title: 'Mobile Application Developer',
      role: 'Mobile Application Developer',
      company: 'Geeks Australia',
      date_range: 'Jul 2022 - Sep 2022',
      description: 'With Geeks Australia, I worked as an intern utilising Flutter and Kotlin to enhance the in-house pre-existing application project that include web/android/iOS. Also, I worked on new and existing customer projects.',
      technologies: ['Flutter', 'Kotlin', 'Android', 'iOS', 'Dart'],
    },
    {
      title: 'IT Support Specialist',
      role: 'IT Support Specialist',
      company: 'Geeks Australia',
      date_range: 'Jul 2022 - Jul 2022',
      description: 'I worked as a technician, working with hardware and customer-facing issues.',
      technologies: ['Technical Support', 'Hardware', 'Troubleshooting'],
    },
    {
      title: 'Professional Year Intern',
      role: 'Professional Year Intern',
      company: 'Professional Year',
      date_range: 'Sep 2021 - Sep 2022',
      description: 'Participated in the ACS-accredited Professional Year Program for IT graduates, combining business communication training, Australian workplace culture, and a 12-week internship.',
      technologies: ['Agile', 'Business Communication', 'Software Development'],
    },
    {
      title: 'Engineering Virtual Program Intern',
      role: 'Goldman Sachs Engineering Virtual Program, Intern',
      company: 'Goldman Sachs',
      date_range: 'Jun 2021 - Jul 2021',
      description: 'Cracking leaked password database, discovering hashing algorithms used for authentication, analyzing security levels and proposing preventive measures against password database attacks.',
      technologies: ['Cybersecurity', 'Password Hashing', 'Security Analysis'],
    },
    {
      title: 'Software Engineering Virtual Experience Intern',
      role: 'JPMorgan Chase Software Engineering Virtual Experience, Internship',
      company: 'JPMorgan Chase & Co.',
      date_range: 'Jun 2021 - Jun 2021',
      description: 'Worked on interface with a stock price data feed, used JPMorgan Chase frameworks and tools, and displayed data visually for traders.',
      technologies: ['Financial Data', 'TypeScript', 'Data Visualization'],
    },
    {
      title: 'Android Engineer Intern',
      role: 'Android Engineer Intern',
      company: 'Beforepay',
      date_range: 'Feb 2020 - Apr 2020',
      description: 'Released alpha/beta apps using Firebase, tested apps across various Android devices, documented bug reports, and managed database KYC checks.',
      technologies: ['Android', 'Java', 'Firebase', 'QA Testing', 'KYC'],
    },
  ],
  education: [
    {
      institution: 'CQUniversity',
      school: 'CQUniversity',
      degree: 'Master of Information Technology',
      field: 'Software Engineering & Mobile Development',
      date_range: 'Graduated',
    },
    {
      institution: 'QIBA',
      school: 'QIBA',
      degree: 'Professional Year Program',
      field: 'Information Technology',
      date_range: 'Completed',
    },
    {
      institution: 'SJC Institute of Technology',
      school: 'SJC Institute of Technology',
      degree: 'Bachelors of Engineering, Computer Science & Engineering',
      field: 'Computer Science',
      date_range: 'Graduated',
    },
  ],
  skills: {
    technical: [
      'JavaScript',
      'React.js',
      'HTML',
      'Flutter',
      'Kotlin',
      'Android',
      'Android Studio',
      'Java',
      'Core Java',
      'Python',
      'Node.js',
      'REST APIs',
      'Firebase',
      'Git',
      'Github',
      'AWS',
      'Google Cloud Infrastructure',
      'Generative AI',
      'Responsible AI',
      'Machine Learning (GCP)',
      'Cybersecurity Fundamentals',
      'Docker',
      'C++',
      'C#',
    ],
    soft: [
      'Problem Solving',
      'Team Leadership',
      'Skilled Multi-tasker',
      'Student Leadership',
      'Adaptability',
      'Communication',
    ],
  },
  projects: [
    {
      title: 'CareNest',
      name: 'CareNest',
      description: 'Care management and invoicing platform for NDIS and disability service providers. Enables client tracking, scheduling, shift notes, and compliance workflows.',
      link: 'https://github.com/ErBishalBudhathoki',
      technologies: ['Flutter', 'Node.js', 'Firebase', 'Cloud Run'],
    },
    {
      title: 'Tenant-Web-App (Hamro Ghar)',
      name: 'Tenant-Web-App',
      description: 'The app being developed is called "Hamro Ghar" meaning "Our Home" to help tenants and owners manage rentals, rooms, and payments.',
      link: 'https://github.com/ErBishalBudhathoki',
      technologies: ['React', 'JavaScript', 'Node.js', 'Express', 'MongoDB'],
    },
    {
      title: 'Invoice Generator',
      name: 'Invoice Generator',
      description: 'Desktop application developed using Java to generate, manage, and print customized business invoices efficiently.',
      link: 'https://github.com/ErBishalBudhathoki',
      technologies: ['Java', 'Swing', 'PDF Generation'],
    },
    {
      title: 'Chess With Knight',
      name: 'Chess With Knight',
      description: 'A 8x8 chessboard game with randomly generated knight moves and puzzle mechanics.',
      link: 'https://github.com/ErBishalBudhathoki',
      technologies: ['Java', 'Game Development', 'Algorithms'],
    },
    {
      title: "Don't Fall Game",
      name: "Don't Fall Game",
      description: 'An Android and PC game where the objective is to maintain balance and avoid falling from platforms.',
      link: 'https://github.com/ErBishalBudhathoki',
      technologies: ['Unity', 'C#', 'Android', 'Game Design'],
    },
    {
      title: 'Automatic Timetable Generation',
      name: 'Automatic Timetable Generation',
      description: 'Research project and application to generate digital clash-free timetables for colleges and universities. Published in an international journal.',
      link: 'https://github.com/ErBishalBudhathoki',
      technologies: ['Java', 'Genetic Algorithms', 'Optimization'],
    },
  ],
  cv_url: 'https://drive.google.com/file/d/1KwrQenriXayZag4hPT9H2d_Jzw605JvV/view?usp=sharing',
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
