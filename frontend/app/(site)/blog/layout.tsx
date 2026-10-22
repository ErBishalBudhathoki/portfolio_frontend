import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Blog & Technical Articles',
  description:
    'Read software engineering articles, tutorials, and technical insights by Bishal Budhathoki covering Flutter, Kotlin, React, Next.js, FastAPI, microservices, and mobile application architecture.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Technical Blog | Bishal Budhathoki',
    description:
      'Engineering articles, tutorials, and practical guides by Software Engineer Bishal Budhathoki.',
    url: 'https://bishalbudhathoki.com/blog',
  },
};

const blogSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': 'https://bishalbudhathoki.com/blog#webpage',
  url: 'https://bishalbudhathoki.com/blog',
  name: 'Bishal Budhathoki Technical Blog',
  description:
    'Articles, tutorials, and engineering writeups on mobile development, full-stack architecture, and modern cloud deployment.',
  author: {
    '@id': 'https://bishalbudhathoki.com/#person',
  },
  publisher: {
    '@id': 'https://bishalbudhathoki.com/#person',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={blogSchema} />
      {children}
    </>
  );
}
