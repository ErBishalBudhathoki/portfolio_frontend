import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Projects & Portfolio',
  description:
    'Explore engineering projects by Bishal Budhathoki: CareNest (NDIS care management and invoicing platform), Hamro Ghar rental management, desktop Invoice Generator, games, and algorithm research.',
  alternates: {
    canonical: '/projects',
  },
  openGraph: {
    title: 'Projects & Engineering Portfolio | Bishal Budhathoki',
    description:
      'Featured software engineering projects by Bishal Budhathoki, spanning cross-platform Flutter mobile apps, Next.js web applications, and Cloud Run microservices.',
    url: 'https://bishalbudhathoki.com/projects',
  },
};

const projectsSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': 'https://bishalbudhathoki.com/projects#webpage',
  url: 'https://bishalbudhathoki.com/projects',
  name: 'Projects & Portfolio | Bishal Budhathoki',
  description:
    'Software engineering portfolio showcasing cross-platform mobile apps, cloud microservices, and web platforms.',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'SoftwareApplication',
        position: 1,
        name: 'CareNest',
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Web, Android, iOS',
        description:
          'Care management and automated invoicing platform for Australian NDIS disability support providers.',
        url: 'https://bishalbudhathoki.com/projects',
        author: {
          '@id': 'https://bishalbudhathoki.com/#person',
        },
      },
      {
        '@type': 'SoftwareApplication',
        position: 2,
        name: 'Hamro Ghar (Tenant-Web-App)',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description:
          'Full-stack rental management web application for landlords, tenants, and property managers.',
        url: 'https://bishalbudhathoki.com/projects',
        author: {
          '@id': 'https://bishalbudhathoki.com/#person',
        },
      },
      {
        '@type': 'SoftwareApplication',
        position: 3,
        name: 'Invoice Generator',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Windows, macOS, Linux',
        description:
          'Desktop application built in Java for generating, managing, and printing compliant commercial invoices.',
        url: 'https://bishalbudhathoki.com/projects',
        author: {
          '@id': 'https://bishalbudhathoki.com/#person',
        },
      },
      {
        '@type': 'SoftwareApplication',
        position: 4,
        name: 'Automatic Timetable Generation System',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Cross-platform',
        description:
          'Genetic algorithm and heuristic constraint-satisfaction university timetabling engine published in an international journal.',
        url: 'https://bishalbudhathoki.com/projects',
        author: {
          '@id': 'https://bishalbudhathoki.com/#person',
        },
      },
    ],
  },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={projectsSchema} />
      {children}
    </>
  );
}
