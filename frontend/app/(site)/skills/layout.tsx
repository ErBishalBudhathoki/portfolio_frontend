import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Skills & Technical Expertise',
  description:
    'Technical proficiencies and skills of Bishal Budhathoki: Flutter, Kotlin, Android, iOS, React, Next.js, Node.js, Python/FastAPI, Java, PostgreSQL, Google Cloud, Docker, and live GitHub contribution activity.',
  alternates: {
    canonical: '/skills',
  },
  openGraph: {
    title: 'Technical Skills & GitHub Activity | Bishal Budhathoki',
    description:
      'Explore Bishal Budhathoki’s technical stack across mobile, frontend, backend, databases, DevOps, and live GitHub commit metrics.',
    url: 'https://bishalbudhathoki.com/skills',
  },
};

const skillsSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://bishalbudhathoki.com/skills#webpage',
  url: 'https://bishalbudhathoki.com/skills',
  name: 'Skills & Technical Expertise | Bishal Budhathoki',
  description:
    'Comprehensive technical skills breakdown and live GitHub contribution activity for Software Engineer Bishal Budhathoki.',
  mainEntity: {
    '@id': 'https://bishalbudhathoki.com/#person',
  },
};

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={skillsSchema} />
      {children}
    </>
  );
}
