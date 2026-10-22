import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'About Me',
  description:
    'Learn about Bishal Budhathoki, Software Engineer based in Sydney. Master of Information Technology from CQUniversity, experience at Geeks Australia, Beforepay, Goldman Sachs, and JPMorgan Chase.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Bishal Budhathoki | Software Engineer',
    description:
      'Professional background, work history, and academic qualifications of Software Engineer Bishal Budhathoki.',
    url: 'https://bishalbudhathoki.com/about',
  },
};

const aboutSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': 'https://bishalbudhathoki.com/about#webpage',
  url: 'https://bishalbudhathoki.com/about',
  name: 'About Bishal Budhathoki',
  description:
    'Professional background, work history, and academic qualifications of Software Engineer Bishal Budhathoki.',
  mainEntity: {
    '@id': 'https://bishalbudhathoki.com/#person',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={aboutSchema} />
      {children}
    </>
  );
}
